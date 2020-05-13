const Sequelize = require('sequelize');
let sequelize = require("./database");

let nametable = 'ALUMNO';

let student = sequelize.define(nametable,{

    ID_ALUMNO:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    USUARIO: Sequelize.STRING,
    CONTRASENHA: Sequelize.STRING,
    NOMBRES: Sequelize.STRING,
    APELLIDOS: Sequelize.STRING,
    CORREO:Sequelize.STRING,
    CODIGO: Sequelize.STRING,
    TELEFONO: Sequelize.STRING,
    DIRECCION: Sequelize.STRING,
    IMAGEN: Sequelize.BLOB,
    ESTADO: Sequelize.INTEGER,
    },
    {
    timestamps :false,
    freezeTableName: true
});

module.exports = student;