const Sequelize = require('sequelize');
let sequelize = require("./database");
let tutor = require('../models/tutor');
let programa = require('./programa');

let nametable = 'DISPONIBILIDAD';

let disponibilidad = sequelize.define(nametable,{

    ID_DISPONIBILIDAD:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ID_TUTOR:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
            model: "TUTOR",
            key: "ID_TUTOR"
        }
    },
    ID_FACULTAD:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
            model: "PROGRAMA",
            key: "ID_PROGRAMA"
        }
    },
    HORA_INICIO: Sequelize.STRING,
    HORA_FIN: Sequelize.STRING,
    FECHA: Sequelize.DATEONLY,
    ESTADO: Sequelize.INTEGER,
    LUGAR: Sequelize.STRING
    },
    {
    timestamps :false,
    freezeTableName: true
});

disponibilidad.belongsTo(tutor, {foreignKey:{name:"ID_TUTOR"}});
disponibilidad.belongsTo(programa, {foreignKey:{name:"ID_FACULTAD"}});

module.exports = disponibilidad;