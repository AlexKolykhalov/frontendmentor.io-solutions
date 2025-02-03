'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Authentication extends Model {
	static associate(models) {}
    }
    Authentication.init({
	email: {
	    type: DataTypes.STRING,
	    allowNull: false
	},
	password: {
	    type: DataTypes.STRING,
	    allowNull: false
	},
	userId: {
	    type: DataTypes.UUID,
	    field: "user_id",
	    allowNull: false,
	}
    }, {
	sequelize,
	modelName: 'Authentication'
    });
    return Authentication;
};
