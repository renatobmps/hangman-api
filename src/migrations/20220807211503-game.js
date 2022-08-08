'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserWords', {
      idUsers: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      idWords: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      done: {
        type: Sequelize.BOOLEAN,
      },
      initialLife: {
        type: Sequelize.INTEGER,
        defaultValue: 6,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserWords');
  }
};
