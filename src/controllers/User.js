const database = require('../models');
const bcrypt = require('bcrypt');

class User {
  static async getAllUsers(req, res) {
    try {
      let users = await database.User.findAll();
      users = users.map(user => {
        return {
          ...user.dataValues,
          password: undefined,
        };
      });
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await database.User.findByPk(req.params.id);
      user.password = undefined;
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  static async createUser(req, res) {
    try {
      req.body.password = await bcrypt.hash(req.body.password, 10);
      const user = await database.User.create(req.body);
      user.password = undefined;
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  static async updateUser(req, res) {
    try {
      const user = await database.User.findByPk(req.params.id);
      await user.update(req.body);
      user.password = undefined;
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  static async deleteUser(req, res) {
    try {
      const user = await database.User.findByPk(req.params.id);
      await user.destroy();
      res.status(200).json({ message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}

module.exports = User;