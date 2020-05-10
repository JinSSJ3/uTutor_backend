const Sequelize = require('sequelize');
let sequelize = require("./database");

let nametable = 'Student';

let student = sequelize.define(nametable,{

    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user: Sequelize.STRING,
    password: Sequelize.STRING,
    name: Sequelize.STRING,
    
    },
    {
    timestamps :false,
    freezeTableName: true
});

module.exports = student;