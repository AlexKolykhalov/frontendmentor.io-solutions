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
	createdAt: {
	    type: DataTypes.DATE,
	    field: "created_at",
	    allowNull: false,
	    defaultValue: DataTypes.NOW
	},
	userId: {
	    type: DataTypes.UUID,
	    field: "user_id",
	    allowNull: false,
	},
    }, {
	sequelize,
	modelName: 'UserToken'	
    });
    return UserToken;
};
