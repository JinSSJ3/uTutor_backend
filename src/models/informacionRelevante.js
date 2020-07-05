const Sequelize = require('sequelize');
let sequelize = require("./database");
let alumno = require("./alumno")

let nametable = 'INFORMACION_RELEVANTE';

let informacionRelevante = sequelize.define(nametable,{
    ID_INFORMACION_RELEVANTE:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ID_ALUMNO:{
        type: Sequelize.INTEGER,
        references: {
            model: "USUARIO",
            key: "ID_USUARIO"
          }
    },
    DESCRIPCION:{
        type: Sequelize.STRING
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