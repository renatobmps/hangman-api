'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserWord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
    idUsers: DataTypes.NUMBER,
    idWords: DataTypes.NUMBER,
    done: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'UserWord',
  });
  return UserWord;
};