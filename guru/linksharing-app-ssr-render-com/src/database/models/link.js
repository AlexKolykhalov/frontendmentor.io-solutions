'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Link extends Model {
	static associate(models) {}
    }
    Link.init({
	source: DataTypes.STRING,
	url: DataTypes.STRING,
	linkId: {
	    type: DataTypes.UUID,
	    field: "link_id",
	    unique: true,
	    allowNull: false,
	},
	userId: {
	    type: DataTypes.UUID,
	    field: "user_id",	    
	    allowNull: false,
	},
    }, {
	sequelize,
	modelName: 'Link'
    });
    return Link;
};
