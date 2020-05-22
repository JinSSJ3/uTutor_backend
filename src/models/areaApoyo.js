const Sequelize = require('sequelize');
let sequelize = require("./database");

let nametable = 'AREA_APOYO';

let areaApoyo = sequelize.define(nametable,{

    ID_AREA_APOYO:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    NOMBRE: Sequelize.STRING,
    TELEFONO: Sequelize.STRING,
    CORREO: Sequelize.STRING     
    },
    {
    timestamps :false,
    freezeTableName: true
});

module.exports = areaApoyo;