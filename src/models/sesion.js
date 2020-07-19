const Sequelize = require('sequelize');
let sequelize = require("./database");
let tutor = require("./tutor");
let procesoTutoria = require("./procesoTutoria");
const areaApoyoXSesion = require('./areaApoyoXSesion');

let nametable = 'SESION';

let sesion = sequelize.define(nametable,{

    ID_SESION:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ID_PROCESO_TUTORIA:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
            model: "PROCESO_TUTORIA",
            key: "ID_PROCESO_TUTORIA"
          }
    },
    ID_TUTOR:{
        type: Sequelize.INTEGER,
        references: {
            model: "TUTOR",
            key: "ID_TUTOR"
          }
    },
    LUGAR: Sequelize.STRING,
    MOTIVO: Sequelize.STRING,
    DESCRIPCION: Sequelize.STRING,
    HORA_INICIO: Sequelize.STRING,
    HORA_FIN: Sequelize.STRING,
    ESTADO: Sequelize.STRING,
    FECHA:  Sequelize.DATEONLY,
    RAZON_MANTENIMIENTO: Sequelize.STRING  
    },
    {
    timestamps :false,
    freezeTableName: true
});

// sesion.belongsTo(procesoTutoria,{foreignKey: "ID_PROCESO_TUTORIA"});
// sesion.belongsTo(tutor,{foreignKey: "ID_TUTOR"});


module.exports = sesion;