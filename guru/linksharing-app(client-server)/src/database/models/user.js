'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
	static associate(models) {
	    this.hasOne(
		models.Authentication,
		{
		    as: "auth",
		    sourceKey: "userId",
		    foreignKey: "userId"
		}
	    );
	    this.hasMany(
		models.UserToken,
		{
		    as: "tokens",
		    sourceKey: "userId",
		    foreignKey: "userId",
		}
	    );
	    this.hasMany(
		models.Link,
		{
		    as: "links",
		    sourceKey: "userId",
		    foreignKey: "userId",
		}
	    );
	}
    }
    User.init({
	userId: {
	    type: DataTypes.UUID,
	    defaultValue: DataTypes.UUIDV4,
	    field: "user_id",	   
	    unique: true
	},
	avatar: {
	    type: DataTypes.TEXT,
	    field: "avatar",
	    defaultValue: ""
	},
	name: {
	    type: DataTypes.STRING,
	    field: "name",
	    defaultValue: "Anonim Anonim"
	},
	email: {
	    type: DataTypes.STRING,
	    defaultValue: "example@mail.com"
	}
    }, {
	sequelize,
	modelName: 'User',
	timestamps: false,
    });
    return User;
};
