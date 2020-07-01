const Sequelize = require('sequelize');
let sequelize = require("./database");
let alumnoXSesion = require("./alumnoXSesion");

let nametable = 'ENCUESTA';

let encuesta = sequelize.define(nametable,{
    ID_ALUMNO:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        foreignKey: true,
        references: {
            model: "ALUMNO_X_SESION",
            key: "ID_ALUMNO"
          }
    }, 
    ID_SESION:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        foreignKey: true,
        references: {
            model: "ALUMNO_X_SESION",
            key: "ID_SESION"
          }
    },  
    SATISFACCION: Sequelize.INTEGER,
    UTILIDAD: Sequelize.INTEGER,
    UTILIZO_RECOMENDACIONES: Sequelize.INTEGER,
    SOLUCIONO_SITUACION: Sequelize.INTEGER,
    RECOMENDARIA: Sequelize.INTEGER    
  },
  {
      timestamps :false,
      freezeTableName: true
  });


encuesta.belongsTo(alumnoXSesion,{foreignKey: "ID_SESION"});
encuesta.belongsTo(alumnoXSesion,{foreignKey:"ID_ALUMNO"});


module.exports = encuesta;