'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('UserWords', [
      {
        idUsers: 9,
        idWords: 2,
        done: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        idUsers: 9,
        idWords: 3,
        done: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        idUsers: 9,
        idWords: 4,
        done: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserWords', null, {});
  }
};
