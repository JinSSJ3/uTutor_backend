const Sequelize = require('sequelize');
let sequelize = require("./database");

let nametable = 'USUARIO';

let usuario = sequelize.define(nametable,{

    ID_USUARIO:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    USUARIO: Sequelize.STRING,
    CONTRASENHA: Sequelize.STRING,
    NOMBRE: Sequelize.STRING,
    APELLIDOS: Sequelize.STRING,
    CORREO:Sequelize.STRING,
    CODIGO: Sequelize.STRING,
    TELEFONO: Sequelize.STRING,
    DIRECCION: Sequelize.STRING,
    IMAGEN: Sequelize.BLOB,    
    },
    {
    timestamps :false,
    freezeTableName: true
});

module.exports = usuario;