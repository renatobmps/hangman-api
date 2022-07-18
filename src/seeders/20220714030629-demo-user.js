'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        name: 'user1',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'user2',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'user3',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Words', null, {});
  }
};
