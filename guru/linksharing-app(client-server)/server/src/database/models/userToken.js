'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UserToken extends Model {
	static associate(models) {}
    }
    UserToken.init({
	token: {
	    type: DataTypes.STRING,
	    allowNull: false,	    
	},
	userId: {
	    type: DataTypes.UUID,
	    field: "user_id",
	    allowNull: false,
	},
    }, {
	sequelize,
	modelName: 'UserToken',
	timestamps: false
    });
    return UserToken;
};
