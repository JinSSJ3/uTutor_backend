const Sequelize = require('sequelize');
let sequelize = require("./database");

let nametable = 'ROL';

let rol = sequelize.define(nametable,{

    ID_ROL:{
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    DESCRIPCION: Sequelize.STRING
    },
    {
    timestamps :false,
    freezeTableName: true
});

module.exports = rol;