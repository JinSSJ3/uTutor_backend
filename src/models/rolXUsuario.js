const Sequelize = require('sequelize');
let sequelize = require("./database");
let rol = require("../models/rol");
let usuario = require('../models/usuario');

let nametable = 'ROL_X_USUARIO';

let rolXUsuario = sequelize.define(nametable,{

    ID_USUARIO:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
            model: "USUARIO",
            key: "ID_USUARIO"
          }
    },
    ID_ROL:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
            model: "ROL",
            key: "ID_ROL"
          }
    },
    ESTADO: Sequelize.INTEGER,
    },
    {
    timestamps :false,
    freezeTableName: true
});

rolXUsuario.belongsTo(usuario, {foreignKey:{name:"ID_USUARIO"}});
rolXUsuario.belongsTo(rol, {foreignKey:{name:"ID_ROL"}});

module.exports = rolXUsuario;