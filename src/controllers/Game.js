const { Op } = require('sequelize');
const { sequelize } = require('../models');
const database = require('../models');
const UserController = require('./User');

let game;

class Game {
  _triedLetters = [];
  _game_id = null;
  _hint = '';
  _lives = 6;
  _points = 0;
  _secret = '';
  _state = 'not started';
  _user = '';
  _word = '';

  static async startGame(req, res) {
    try {
      const { id } = req.user;
      const hasGame = await Game.userGame(id);
      const game = new Game({
        ...req.user,
        ...hasGame ? hasGame : await Game.generateSecretWord(id),
      });
      await game.updateStatus();
      res.status(200).json(game.status);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async guessLetter(req, res) {
    try {
      const { id } = req.user;
      const { letter } = req.body;

      const startedGame = await Game.userGame(id);
      if (!startedGame) return res.status(400).json({ error: "You have not started a game" });
      const game = new Game({
        ...req.user,
        ...startedGame
      });
      await game.updateStatus();

      await game.tryLetter(letter);

      res.status(200).json(game.status);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  constructor(gameData) {
    const {
      idGame, hint, initialLife, points, word, name
    } = gameData;

    this._triedLetters = [];
    this._game_id = idGame;
    this._hint = hint.toLowerCase();
    this._lives = initialLife;
    this._points = points;
    this._secret = word.toLowerCase();
    this._state = 'playing';
    this._user = name;
    this._word = word.toLowerCase().replace(/[a-záàâãéèêíïóôõöúçñ]/gi, "_");
  }

  get status() {
    return {
      user: this._user,
      points: this._points,
      lives: this._lives,
      word: this._word,
      hint: this._hint,
      triedLetters: this._triedLetters,
      state: this._state,
    }
  }

  static async userGame(userId) {
    try {
      const playedWords = await database.UserWord.findAll({ raw: true, where: { idUsers: userId } });
      const wordsWin = playedWords.filter(word => !!word.done);
      const userGame = playedWords.find(word => word.done === null);
      if (!userGame) return null;
      return {
        idGame: userGame.id,
        points: wordsWin.length,
        ...userGame,
        ...await database.Word.findByPk(userGame.idWords, { raw: true }),
      }
    } catch (err) {
      throw new Error(err.message || err || "Error finding user game");
    }
  }

  static async generateSecretWord(userId) {
    try {
      const playedWords = await database.UserWord.findAll({ raw: true, where: { idUsers: userId } });
      const wordsWin = playedWords.filter(word => !!word.done);
      const wordsLose = playedWords.filter(word => !word.done);
      const newWords = await database.Word.findAll({ raw: true, where: { id: { [Op.notIn]: playedWords.map(word => word.idWords) } } });
      const randomWord = newWords[Math.floor(Math.random() * newWords.length)];
      const newWord = randomWord || wordsLose[Math.floor(Math.random() * wordsLose.length)];

      if (!newWord) throw new Error("There is no word to play");

      let userGame = await database.UserWord.findOne({ raw: true, where: { idUsers: userId, idWords: newWord.id } });

      if (!userGame) {
        userGame = await database.UserWord.create({ idUsers: userId, idWords: newWord.id, initialLife: 6 }, { raw: true });
      } else {
        await database.UserWord.update({ done: null }, { where: { idUsers: userId, idWords: newWord.id } });
      }

      return {
        idGame: userGame.id,
        points: wordsWin.length,
        ...userGame.dataValues || userGame,
        ...newWord,
      }
    } catch (err) {
      throw new Error(err.message || err || "Error finding user game");
    }
  }

  async updateStatus() {
    try {
      let triedLetters = await database.TriedLetters.findAll({ raw: true, where: { idUserWords: this._game_id } });
      triedLetters.forEach(letter => {
        this.tryLetter(letter.letter, letter.id);
      });
    } catch (err) {
      throw new Error(err.message || err || "Error finding user game");
    }
  }

  async tryLetter(letter, idLetter = null) {
    try {
      if (this._state !== 'playing') throw new Error("You are not playing");
      if (this._state === "finished") throw new Error("Game is finished");
      if (this._state === "lost") throw new Error("Game is lost");
      if (this._state === "won") throw new Error("Game is won");

      const data = {
        letter: letter.toLowerCase(),
      };

      data.isValid = this.isValidLetter(data.letter);
      if (!data.isValid) throw new Error(`Letter must be one character. Informed: ${letter}`);

      data.isTried = this._triedLetters.includes(data.letter);
      if (data.isTried) throw new Error(`Letter ${data.letter} already tried`);

      this._triedLetters.push(data.letter);

      const letterVariants = {
        a: 'áàâã',
        e: 'éèê',
        i: 'íï',
        o: 'óôõö',
        u: 'ú',
        c: 'ç',
        n: 'ñ',
      };
      data.variants = letterVariants[data.letter] || '';

      const withoutSpecial = this._secret.split('').map(char => {
        if (data.variants.includes(char)) return data.letter;
        return char;
      }).join('');

      data.indexes = [];
      withoutSpecial.split('').forEach((char, index) => {
        if (char === data.letter) data.indexes.push(index);
      });
      data.hasWord = data.indexes.length > 0;


      data.indexes.forEach(index => {
        const letter = this._secret[index];
        this._word = this._word.substring(0, index) + letter + this._word.substring(index + 1);
      });

      if (!data.hasWord) this._lives--;
      if (this._lives === 0) this._state = 'lost';
      if (this._word === this._secret) this._state = 'won';

      if (idLetter) {
        await database.TriedLetters.update({ correct: data.hasWord }, { where: { id: idLetter } });
      } else {
        await database.TriedLetters.create({
          letter: data.letter, correct: data.hasWord, idUserWords: this._game_id
        });
      }
    } catch (err) {
      throw new Error(err.message || err || 'Error while trying to guess letter');
    }
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
}

module.exports = Game;
