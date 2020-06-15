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
        IMAGEN: Sequelize.STRING,
        TELEFONO: Sequelize.STRING,
        PAGINA_WEB: Sequelize.STRING,
        DOMINIO: Sequelize.STRING,
        DOMINIO2: Sequelize.STRING,
        UBICACION: Sequelize.STRING
    },
    {
        timestamps: false,
        freezeTableName: true
    }
);

module.exports = institucion;