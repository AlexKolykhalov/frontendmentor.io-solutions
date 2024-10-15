'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
	await queryInterface.createTable('Authentications', {
	    id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: Sequelize.INTEGER
	    },
	    email: {
		type: Sequelize.STRING
	    },
	    password: {
		type: Sequelize.STRING
	    },
	    user_id: {
		type: Sequelize.UUID,
		references: {
		    model: "Users",
		    key: "user_id"
		}
	    }
	});
	await queryInterface.sequelize.query('ALTER TABLE "Authentications" ENABLE ROW LEVEL SECURITY;');
    },
    async down(queryInterface, _) {
	await queryInterface.dropTable('Authentications');
    }
};
