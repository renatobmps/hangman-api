'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TriedLetters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      letter: {
        type: Sequelize.STRING
      },
      idUserWords: {
        type: Sequelize.INTEGER
      },
      done: {
        type: Sequelize.BOOLEAN
      },
      initialLife: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TriedLetters');
  }
};
