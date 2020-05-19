const Sequelize = require('sequelize');
let sequelize = require("./database");

let nametable = 'ETIQUETA';

let etiqueta = sequelize.define(nametable,{

    ID_ETIQUETA:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    DESCRIPCION: Sequelize.STRING
    },
    {
    timestamps :false,
    freezeTableName: true,       
});


module.exports = etiqueta;