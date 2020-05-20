const Sequelize = require('sequelize');
let sequelize = require("./database");

let nametable = 'INSTITUCION';

let institucion = sequelize.define(
    nametable,
    {
        ID_INSTITUCION: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        NOMBRE: Sequelize.STRING,
        INICIALES: Sequelize.STRING,
        IMAGEN: Sequelize.BLOB,
        TELEFONO: Sequelize.STRING,
        PAGINA_WEB: Sequelize.STRING,
        UBICACION: Sequelize.STRING,
        FACEBOOK: Sequelize.STRING,
        TWITTER: Sequelize.STRING,
        YOUTUBE: Sequelize.STRING
    },
    {
        timestamps: false,
        freezeTableName: true
    }
);

module.exports = institucion;