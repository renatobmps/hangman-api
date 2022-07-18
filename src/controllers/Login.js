const database = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class Login {
  constructor(loginService) {
    this.loginService = loginService;
  }

  static async login(req, res) {
    const { user, password } = req.body;

    try {
      const userData = await database.User.findOne({
        where: {
          name: user,
        },
      });

      if (!userData) {
        res.status(401).json({ error: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(password, userData.password);

      if (!isPasswordValid) {
        res.status(401).json({ error: 'Password is incorrect' });
      }

      const token = jwt.sign({
        id: userData.id,
        name: userData.name,
      }, process.env.JWT_SECRET);

      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}

module.exports = Login;