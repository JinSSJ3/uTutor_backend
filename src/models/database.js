var Sequelize = require('sequelize');
require('dotenv').config();


const sequelize = new Sequelize( 
    {username: process.env.USR,
    password: process.env.PSSW,
    database: process.env.DATABASE,
    host: process.env.HOST, 
    port: Number(process.env.PORTDB),
    dialect: "mysql"
    }
);

module.exports = sequelize; 