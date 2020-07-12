const Sequelize = require('sequelize');
let sequelize = require("./database");
let alumno = require("./alumno");
let sesion = require("./sesion");

let nametable = 'ALUMNO_X_SESION';

let alumnoXSesion = sequelize.define(nametable,{
  ASISTENCIA_ALUMNO: Sequelize.TINYINT
  },
  {
      timestamps :false,
      freezeTableName: true
  });


// alumno.belongsToMany(sesion, {through: alumnoXSesion, foreignKey: "ID_ALUMNO", otherKey: "ID_SESION"})
// sesion.belongsToMany(alumno, {through: alumnoXSesion, foreignKey: "ID_SESION", otherKey: "ID_ALUMNO"})
// alumnoXSesion.belongsTo(alumno,{foreignKey: "ID_ALUMNO"});
// alumnoXSesion.belongsTo(sesion,{foreignKey: "ID_SESION"});

module.exports = alumnoXSesion;