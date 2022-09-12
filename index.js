require('dotenv').config();
const express = require('express');
const db = require('./src/models');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors('*'));

db.sequelize.sync().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.info(`Server is running on port ${process.env.PORT || 3000}`);
  });
}).catch(err => {
  throw new Error(err);
});

// middlewares
const checkLogin = require('./src/middlewares/login');

// routes
const user = require('./src/controllers/User');
app.post('/users', user.createUser);
app.get('/users', checkLogin.login, user.getAllUsers);
app.get('/users/:id', checkLogin.login, user.getUserById);
app.put('/users/', checkLogin.login, user.updateUser);
app.delete('/users/:id', checkLogin.admLogin, user.deleteUser);

const word = require('./src/controllers/Word');
app.post('/words', checkLogin.admLogin, word.createWord);
app.get('/words', checkLogin.admLogin, word.getAllWords);
app.get('/words/:id', checkLogin.admLogin, word.getWordById);
app.put('/words/:id', checkLogin.admLogin, word.updateWord);
app.delete('/words/:id', checkLogin.admLogin, word.deleteWord);

const login = require('./src/controllers/Login');
app.post('/login', login.login);

const game = require('./src/controllers/Game');
app.get('/games/start', checkLogin.login, game.startGame);
app.post('/games/guess', checkLogin.login, game.guessLetter);
