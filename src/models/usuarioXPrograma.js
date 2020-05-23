const Sequelize = require('sequelize');
let sequelize = require("./database");
const usuario = require('./usuario');
const programa = require('./programa');

let nametable = 'USUARIO_X_PROGRAMA';

let usuarioXPrograma = sequelize.define(nametable,
    {
       /* ID_USUARIO:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
            model: "USUARIO",
            key: "ID_USUARIO"
        }},
        ID_PROGRAMA:{
            type: Sequelize.INTEGER,
            primaryKey: true,
            references: {
                model: "PROGRAMA",
                key: "ID_PROGRAMA"
        }},
        */
    },
    {
    timestamps :false,
    freezeTableName: true,       
});

usuario.belongsToMany(programa, {through: usuarioXPrograma, foreignKey: "ID_USUARIO", otherKey: "ID_PROGRAMA"});
programa.belongsToMany(usuario, {through: usuarioXPrograma, foreignKey: "ID_PROGRAMA", otherKey: "ID_USUARIO"});
usuarioXPrograma.belongsTo(programa,{foreignKey: "ID_PROGRAMA"});
usuarioXPrograma.belongsTo(usuario,{foreignKey: "ID_USUARIO"});
usuario.hasMany(usuarioXPrograma, {foreignKey: "ID_USUARIO"});
programa.hasMany(usuarioXPrograma, {foreignKey: "ID_PROGRAMA"});

module.exports = usuarioXPrograma;