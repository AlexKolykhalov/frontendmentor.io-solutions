'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, _) {
	try {
	    await queryInterface.sequelize.query('ALTER TABLE "SequelizeMeta" ENABLE ROW LEVEL SECURITY;');
	} catch (error) {
	    console.log(JSON.stringify(error, null, 2));
	}
    },
    async down(_, __) {}
};
