'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'UserWords',
      'initialLife',
      {
        type: Sequelize.INTEGER,
        defaultValue: 6,
        allowNull: false,
      }
    )
  },

  async down(queryInterface) {
    return queryInterface.removeColumn('UserWords', 'initialLife')
  }
};
