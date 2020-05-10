var Sequelize = require('sequelize');

const sequelize = new Sequelize(
    {username: "KNDadmin",
    password: "teamotys123",
    database: "KNDdb",
    host: "knd-instdb.cywuoagpzvfc.us-east-1.rds.amazonaws.com",
    port: "3306",
    dialect: 'mysql'
    }
);

module.exports = sequelize;