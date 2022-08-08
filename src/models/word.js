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
    word: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      }
    },
    hint: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^[A-zÀ-ú]+$/
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Word',
    raw: true,
  });
  return Word;
};