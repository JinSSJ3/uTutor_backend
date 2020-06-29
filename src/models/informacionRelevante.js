const Sequelize = require('sequelize');
let sequelize = require("./database");
let alumno = require("./alumno")

let nametable = 'INFORMACION_RELEVANTE';

let informacionRelevante = sequelize.define(nametable,{

    ID_ALUMNO:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
            model: "USUARIO",
            key: "ID_USUARIO"
          }
    },
    DESCRIPCION:{
        type: Sequelize.STRING,
        primaryKey: true,
    },
    ARCHIVO: Sequelize.STRING        
},
{
    timestamps :false,
    freezeTableName: true
});



informacionRelevante.belongsTo(alumno, {foreignKey:{name:"ID_ALUMNO"}});
alumno.hasMany(informacionRelevante, {foreignKey:{name: "ID_ALUMNO"}});

module.exports = informacionRelevante;