require("dotenv").config();

module.exports = {
    "development": {
	"username": process.env.DEV_DB_USERNAME,
	"password": process.env.DEV_DB_PASSWORD,
	"database": process.env.DEV_DB_DATABASE,
	"host":     process.env.DEV_DB_HOST,
	"dialect":  "postgres",
	"timezone": "+00:00",
	"define": {
	    timestamps: false
	},
	"options": {
	    "quoteIdentifiers": false
	}
    },
    "test": {
	"username": process.env.TEST_DB_USERNAME,
	"password": process.env.TEST_DB_PASSWORD,
	"database": process.env.TEST_DB_DATABASE,
	"host":     process.env.TEST_DB_HOST,
	"dialect":  "postgres"
    },
    "production": {
	"username": process.env.PROD_DB_USERNAME,
	"password": process.env.PROD_DB_PASSWORD,
	"database": process.env.PROD_DB_DATABASE,
	"host":     process.env.PROD_DB_HOST,
	"dialect":  "postgres",
	"timezone": "+00:00",
	"define": {
	    timestamps: false
	},
	"dialectOptions": {
	    "dialectModule": require("pg")
	},
	"options": {
	    "quoteIdentifiers": false
	}
    }
}
