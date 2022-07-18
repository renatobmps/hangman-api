require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// middlewares
const checkLogin = require('./src/middlewares/login');

// routes
const user = require('./src/controllers/User');
app.post('/users', user.createUser);
app.get('/users', checkLogin.login, user.getAllUsers);
app.get('/users/:id', checkLogin.login, user.getUserById);
app.put('/users/:id', checkLogin.login, user.updateUser);
app.delete('/users/:id', checkLogin.login, user.deleteUser);

const word = require('./src/controllers/Word');
app.post('/words', checkLogin.login, word.createWord);
app.get('/words', checkLogin.login, word.getAllWords);
app.get('/words/:id', checkLogin.login, word.getWordById);
app.put('/words/:id', checkLogin.login, word.updateWord);
app.delete('/words/:id', checkLogin.login, word.deleteWord);

const login = require('./src/controllers/Login');
app.post('/login', login.login);

const game = require('./src/controllers/Game');
app.get('/games/start', checkLogin.login, game.startGame);
app.post('/games/guess', checkLogin.login, game.guessLetter);