const Sequelize = require('sequelize');
let sequelize = require("./database");
let usuario = require("./usuario");
let rol = require("./rol");

let nametable = 'ROL_X_USUARIO';

let rolXUsuario = sequelize.define(nametable,{

  /*  ID_USUARIO:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        foreignKey:true,
        references: {
            model: "USUARIO",
            key: "ID_USUARIO"
        }
    },
    ID_ROL: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        foreignKey:true,
        references: {
            model: "ROL",
            key: "ID_ROL"
        }       
    }*/
    ESTADO: Sequelize.TINYINT
},
{
    timestamps :false,
    freezeTableName: true
});

usuario.belongsToMany(rol, {through: rolXUsuario, foreignKey: "ID_USUARIO", otherKey: "ID_ROL"})
rol.belongsToMany(usuario, {through: rolXUsuario, foreignKey: "ID_ROL", otherKey: "ID_USUARIO"})
rolXUsuario.belongsTo(usuario,{foreignKey: "ID_USUARIO"});
rolXUsuario.belongsTo(rol,{foreignKey: "ID_ROL"});

module.exports = rolXUsuario;