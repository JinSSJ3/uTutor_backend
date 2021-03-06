const Sequelize = require('sequelize');
let sequelize = require("./database");
let programa = require("./programa");

let nametable = 'PROCESO_TUTORIA';

let procesoTutoria = sequelize.define(nametable,{

    ID_PROCESO_TUTORIA:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ID_PROGRAMA:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
            model: "PROGRAMA",
            key: "ID_PROGRAMA"
          }
    },
    NOMBRE: Sequelize.STRING,
    DESCRIPCION: Sequelize.STRING,
    OBLIGATORIO:Sequelize.TINYINT,
    TUTOR_FIJO: Sequelize.TINYINT,
    GRUPAL: Sequelize.TINYINT,
    TUTOR_ASIGNADO: Sequelize.TINYINT,
    PERMANENTE: Sequelize.TINYINT,
    DURACION: Sequelize.INTEGER,    
    ESTADO: {
        type: Sequelize.TINYINT,
        defaultValue: 1 
    }    
    },
    {
    timestamps :false,
    freezeTableName: true,       
});

// procesoTutoria.belongsTo(programa, {foreignKey:{name:"ID_PROGRAMA"}});

module.exports = procesoTutoria;