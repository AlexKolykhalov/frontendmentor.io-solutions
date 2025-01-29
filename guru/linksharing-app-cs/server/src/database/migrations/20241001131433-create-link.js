'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
	await queryInterface.createTable('Links', {
	    id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: Sequelize.INTEGER
	    },
	    url: {
		type: Sequelize.STRING
	    },
	    link_id: {
		type: Sequelize.UUID,
		unique: true
	    },
	    user_id: {
		type: Sequelize.UUID,
		references: {
		    model: "Users",
		    key: "user_id"
		}
	    }
	});
	await queryInterface.sequelize.query('ALTER TABLE "Links" ENABLE ROW LEVEL SECURITY;');
    },
    async down(queryInterface, Sequelize) {
	await queryInterface.dropTable('Links');
    }
};
