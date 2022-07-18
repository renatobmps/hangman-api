'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Word extends Model {
    static associate(models) {
      Word.hasMany(models.UserWord, {
        foreignKey: 'idWords',
        as: 'userWords'
      });
    }
  }
  Word.init({
    word: DataTypes.STRING,
    hint: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Word',
  });
  return Word;
};