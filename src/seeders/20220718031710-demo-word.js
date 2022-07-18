'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Words', [
      {
        word: 'lorem',
        hint: 'lorem ipsum',
        description: 'lorem ipsum dolor sit amet',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        word: 'ipsum',
        hint: 'ipsum lorem',
        description: 'ipsum lorem dolor sit amet',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        word: 'dolor',
        hint: 'dolor ipsum',
        description: 'dolor ipsum dolor sit amet',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Words', null, {});
  }
};
