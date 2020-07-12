const Sequelize = require('sequelize');
let sequelize = require("./database");
let usuario = require("./usuario");
let sesion = require("./sesion");

let nametable = 'NOTIFICACION';

let notificacion = sequelize.define(nametable,{
    ID_NOTIFICACION: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ID_SESION: {
        type: Sequelize.INTEGER,
        references: {
            model: "SESION",
            key: "ID_SESION"
          }
    },
    ESTADO: Sequelize.INTEGER,
    MENSAJE: Sequelize.STRING  
    },
    {
    timestamps :false,
    freezeTableName: true
});

// notificacion.belongsTo(sesion,{foreignKey: "ID_SESION"});
// notificacion.belongsTo(usuario,{as: 'EMISOR',foreignKey: "ID_EMISOR"});
// notificacion.belongsTo(usuario,{as: 'RECEPTOR',foreignKey: "ID_RECEPTOR"});

module.exports = notificacion;