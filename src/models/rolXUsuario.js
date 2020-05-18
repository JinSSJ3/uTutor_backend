const Sequelize = require('sequelize');
let sequelize = require("./database");
let usuario = require("./usuario");
let rol = require("./rol");

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
    ID_ROL: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
            model: "ROL",
            key: "ID_ROL"
        }       
    }
},
{
    timestamps :false,
    freezeTableName: true
});

rolXUsuario.belongsTo(usuario, {foreignKey:{name:"ID_USUARIO"}});
rolXUsuario.belongsTo(rol, {foreignKey:{name:"ID_ROL"}});

module.exports = rolXUsuario;