'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
	await queryInterface.createTable('UserTokens', {
	    id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: Sequelize.INTEGER
	    },
	    token: {
		type: Sequelize.STRING
	    },
	    created_at: {
		allowNull: false,
		type: Sequelize.DATE
	    },
	    user_id: {
		type: Sequelize.UUID,
		references: {
		    model: "Users",
		    key: "user_id"
		}
	    }
	});
	await queryInterface.sequelize.query('ALTER TABLE "UserTokens" ENABLE ROW LEVEL SECURITY;');
    },
    async down(queryInterface, _) {
	await queryInterface.dropTable('UserTokens');
    }
};
