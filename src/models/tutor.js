const Sequelize = require('sequelize');
let sequelize = require("./database");
let usuario = require('../models/usuario');

let nametable = 'TUTOR';

let tutor = sequelize.define(nametable,{

    ID_TUTOR:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
            model: "USUARIO",
            key: "ID_USUARIO"
          }
    },

    },
    {
    timestamps :false,
    freezeTableName: true
});

// tutor.belongsTo(usuario, {foreignKey:{name:"ID_TUTOR"}});

module.exports = tutor;