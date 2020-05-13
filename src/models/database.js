var Sequelize = require('sequelize');
require('dotenv').config();

console.log(process.env.USR)
console.log(process.env.DATABASE)
console.log(process.env.PORTDB)
console.log(process.env.PSSW)


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