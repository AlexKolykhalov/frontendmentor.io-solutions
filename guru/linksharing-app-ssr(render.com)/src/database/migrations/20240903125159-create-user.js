'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
	await queryInterface.createTable('Users', {
	    id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: Sequelize.INTEGER
	    },
	    user_id: {
		type: Sequelize.UUID,
		unique: true
	    },
	    avatar: {
		type: Sequelize.TEXT
	    },
	    name: {
		type: Sequelize.STRING
	    },
	    email: {
		type: Sequelize.STRING,
	    }
	});
	await queryInterface.sequelize.query('ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;');
    },
    async down(queryInterface, _) {
	await queryInterface.dropTable('Users');
    }
};
