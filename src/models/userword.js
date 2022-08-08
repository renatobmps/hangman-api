'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserWord extends Model {
    static associate(models) {
      UserWord.belongsTo(models.User, {
        foreignKey: 'idUsers',
        as: 'user'
      });
      UserWord.belongsTo(models.Word, {
        foreignKey: 'idWords',
        as: 'word'
      });
    }
  }
  UserWord.init({
    idUsers: DataTypes.INTEGER,
    idWords: DataTypes.INTEGER,
    done: DataTypes.BOOLEAN,
    initialLife: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'UserWord',
    raw: true,
  });
  return UserWord;
};