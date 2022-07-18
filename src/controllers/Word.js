const database = require('../models');

class Word {
  static async getAllWords(req, res) {
    try {
      let words = await database.Word.findAll();
      res.status(200).json(words);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  static async getWordById(req, res) {
    try {
      const word = await database.Word.findByPk(req.params.id);
      res.status(200).json(word);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  static async createWord(req, res) {
    try {
      const word = await database.Word.create(req.body);
      res.status(201).json(word);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  static async updateWord(req, res) {
    try {
      const word = await database.Word.findByPk(req.params.id);
      await word.update(req.body);
      res.status(200).json(word);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  static async deleteWord(req, res) {
    try {
      const word = await database.Word.findByPk(req.params.id);
      await word.destroy();
      res.status(200).json({ message: 'Word deleted' });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}

module.exports = Word;