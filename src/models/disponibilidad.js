const Sequelize = require('sequelize');
let sequelize = require("./database");
let tutor = require('../models/tutor');

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

module.exports = disponibilidad;