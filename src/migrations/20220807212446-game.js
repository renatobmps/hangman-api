'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserWords', {
      id: Sequelize.INTEGER,
      idUsers: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      idWords: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      done: Sequelize.BOOLEAN,
      initialLife: {
        type: Sequelize.INTEGER,
        defaultValue: 6,
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
    await queryInterface.dropTable('UserWords');
  }
};
