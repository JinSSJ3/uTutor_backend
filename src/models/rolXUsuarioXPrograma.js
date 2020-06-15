const Sequelize = require('sequelize');
let sequelize = require("./database");
let usuario = require("./usuario");
let rol = require("./rol");
let programa = require("./programa");

let nametable = 'ROL_X_USUARIO_X_PROGRAMA';

let rolXUsuarioXPrograma = sequelize.define(nametable,{

    ID_ROL_X_USUARIO_X_PROGRAMA:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ESTADO: Sequelize.TINYINT    
},
{
    timestamps :false,
    freezeTableName: true
});

usuario.belongsToMany(rol, {through: rolXUsuarioXPrograma, foreignKey: "ID_USUARIO", otherKey: "ID_ROL"});
usuario.belongsToMany(programa, {through: rolXUsuarioXPrograma, foreignKey: "ID_USUARIO", otherKey: "ID_PROGRAMA"});
rol.belongsToMany(usuario, {through: rolXUsuarioXPrograma, foreignKey: "ID_ROL", otherKey: "ID_USUARIO"});
rol.belongsToMany(programa, {through: rolXUsuarioXPrograma, foreignKey: "ID_ROL", otherKey: "ID_PROGRAMA"});
programa.belongsToMany(usuario, {through: rolXUsuarioXPrograma, foreignKey: "ID_PROGRAMA", otherKey: "ID_USUARIO"});
programa.belongsToMany(rol, {through: rolXUsuarioXPrograma, foreignKey: "ID_PROGRAMA", otherKey: "ID_ROL"});

rolXUsuarioXPrograma.belongsTo(usuario,{foreignKey: "ID_USUARIO"});
rolXUsuarioXPrograma.belongsTo(rol,{foreignKey: "ID_ROL"});
rolXUsuarioXPrograma.belongsTo(programa,{foreignKey: "ID_PROGRAMA"});

usuario.hasMany(rolXUsuarioXPrograma, {foreignKey: "ID_USUARIO"});
programa.hasMany(rolXUsuarioXPrograma, {foreignKey: "ID_PROGRAMA"});
rol.hasMany(rolXUsuarioXPrograma, {foreignKey: "ID_ROL"});

module.exports = rolXUsuarioXPrograma;