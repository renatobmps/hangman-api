const { Op } = require('sequelize');
const { sequelize } = require('../models');
const database = require('../models');
const UserController = require('./User');

let game;

class Game {
  _secret = "";
  _word;
  _hint = "";
  _lives;
  _state = "playing";
  _alreadyTried = [];

  constructor(userName) {
    this.init(userName).then(() => {
      console.info("Game started");
    }).catch(err => {
      console.error(err);
    });
  }

  async init(userName) {
    this._userName = userName;
    this._userPoints = await UserController.getUserPoints(userName);
    this._lives = 6;
    const hasWord = await this.userHasWord();
    this._secret = await hasWord ? await this._secret : await this.generateSecretWord();
    this._word = this._secret.replace(/\w/g, "_");
    if (!this._secret) throw new Error("Could not generate secret word");
  }

  get secret() {
    return this._word;
  }

  get word() {
    return this._word;
  }

  get lives() {
    return this._lives;
  }

  get userName() {
    return this._userName;
  }

  get userPoints() {
    return this._userPoints;
  }

  get state() {
    return this._state;
  }

  get alreadyTried() {
    return this._alreadyTried;
  }

  get hint() {
    return this._hint;
  }

  get status() {
    this._state = this.checkIfWon()
      ? "won"
      : this._lives > 0
        ? "playing"
        : "lost";

    this.updateGame();
    return {
      lives: this.lives,
      state: this.state,
      triedLetters: this.alreadyTried,
      word: this.word,
      hint: this.hint,
      user: this.userName,
      points: this.userPoints,
    };
  }

  updateGame() {
    const allowCases = {
      won: async () => {
        const user = await database.User.findOne({ raw: true, where: { name: this._userName } });
        const word = await database.Word.findOne({ raw: true, where: { word: this._secret } });
        console.log('[UPDATING]', {
          user,
          word,
          userWordUser: await database.UserWord.findAll({ raw: true, where: { idUsers: user.id } }),
          userWordWord: await database.UserWord.findAll({ raw: true, where: { idWords: word.id } }),
          userWordBoth: await database.UserWord.findAll({ raw: true, where: { idUsers: user.id, idWords: word.id } }),
        })
        await database.UserWord.update({ done: true }, { where: { idUsers: user.id, idWords: word.id } });
      },
      lost: async () => {
        const user = await database.User.findOne({ where: { name: this._userName } });
        const word = await database.Word.findOne({ where: { word: this._secret } });
        await database.UserWord.update({ done: false }, { where: { idUsers: user.id, idWords: word.id } });
      },
      playing: () => { return }
    }

    const selectedCase = allowCases[this.state];
    if (!selectedCase) throw new Error("Invalid state");

    selectedCase();
  }

  static startGame(req, res) {
    const { user } = req;
    if (!user || !user.id || !user.name) throw new Error("User not logged");

    game = new Game(user.name);
    game.init(user.name).then(() => {
      res.status(200).json(game.status);
    }).catch(err => {
      res.status(500).json({ error: err.message });
    });
  }

  static guessLetter(req, res) {
    const { user } = req;
    if (!user || !user.id || !user.name) throw new Error("User not logged");
    if (!game) throw new Error("Game not started");
    if (game.status.state === "lost") throw new Error("Game is finished");

    const { letter } = req.body;

    game.tryLetter(letter);

    res.status(200).json(game.status);
  }

  static finishGame(req, res) {
    const { user } = req;
    if (!user || !user.id || !user.name) throw new Error("User not logged");
    if (!game) throw new Error("Game not started");
    if (game.status.state === "lost") throw new Error("Game is finished");

    game.finish();

    res.status(200).json(game.status);
  }

  finish() {
    this._state = "lost";
    this._lives = 0;
  }

  tryLetter(letter) {
    if (this._state === "finished") throw new Error("Game is finished");
    if (this._state === "lost") throw new Error("Game is lost");
    if (this._state === "won") throw new Error("Game is won");

    letter = letter.toLowerCase();
    if (!this.isValidLetter(letter)) {
      const messageError = `Letter must be one character. Informed: ${letter}`;
      throw new Error(messageError);
    }

    if (this._alreadyTried.includes(letter)) {
      throw new Error("Letter already tried");
    }

    this._alreadyTried.push(letter);
    const index = this._secret.indexOf(letter);

    if (index === -1) {
      this._lives--;
    }

    if (this._lives === 0) {
      this._state = "lost";
    }

    const splittedWord = this._secret.split("");
    splittedWord.forEach((secretLetter, index) => {
      if (secretLetter === letter) {
        const splittedWord = this.word.split("");
        splittedWord[index] = secretLetter;
        this._word = splittedWord.join("");
      }
    });

    if (this._word === this._secret) {
      this._state = "won";
    }
  }

  checkIfWon() {
    return `${this.word}`.toLowerCase() === `${this._secret}`.toLowerCase();
  }

  isValidLetter(letter) {
    const acceptedLetters = [
      "a", "b", "c", "d", "e", "f", "g", "h",
      "i", "j", "k", "l", "m", "n", "o", "p",
      "q", "r", "s", "t", "u", "v", "w", "x",
      "y", "z",
    ];
    return acceptedLetters.includes(letter);
  }

  async userHasWord() {
    const { _userName } = this;

    const user = await database.User.findOne({ where: { name: _userName } });
    const userWord = await database.UserWord.findOne({ where: { idUsers: user.id, done: null } });

    const completeUserWord = await database.UserWord.findAll({});

    if (!userWord) return false;

    const word = await database.Word.findOne({ where: { id: userWord.idWords } });
    this._secret = word.word.toLowerCase() || null;
    this._hint = word.hint || null;

    return !!word;
  }


  generateSecretWord() {
    return new Promise(async (resolve, reject) => {
      try {
        const { _userName } = this;

        const user = await database.User.findOne({ where: { name: _userName } });
        const allWordToUser = await database.UserWord.findAll({ where: { idUsers: user.id, done: true } });
        const allIds = allWordToUser.map(word => word.idWords);
        const funcRandom = {
          sqlite: 'RANDOM',
          mysql: 'RAND',
          postgres: 'RANDOM',
          mssql: 'NEWID',
          oracle: 'DBMS_RANDOM.VALUE',
          mariadb: 'RANDOM',
        };
        const randomFunctionName = funcRandom[database.sequelize.getDialect()];
        if (!randomFunctionName) throw new Error(`Invalid random function for ${database.sequelize.getDialect()}`);
        const newWord = await database.Word.findOne({
          where: { id: { [Op.notIn]: allIds } },
          order: [sequelize.fn(randomFunctionName)],
        });

        const generatedSecretWord = newWord ? newWord.word.toLowerCase() : null;
        if (!generatedSecretWord) throw new Error("There is no more words!");

        if (!!newWord) await database.UserWord.create({
          idUsers: user.id,
          idWords: newWord.id,
          done: null,
        });

        this._secret = generatedSecretWord;
        this._hint = await newWord.hint || null;

        resolve(generatedSecretWord);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = Game;
