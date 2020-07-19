const Sequelize = require('sequelize');
let sequelize = require("./database");
let areaApoyo = require("./areaApoyo");
let sesion = require("./sesion");

let nametable = 'AREA_APOYO_X_SESION';

let areaApoyoXSesion = sequelize.define(nametable,{
  },
  {
      timestamps :false,
      freezeTableName: true
  });

/* areaApoyo.belongsToMany(sesion, {through: areaApoyoXSesion, foreignKey: "ID_AREA_APOYO", otherKey: "ID_SESION"})
areaApoyo.belongsToMany(alumno, {through: areaApoyoXSesion, foreignKey: "ID_AREA_APOYO", otherKey: "ID_ALUMNO"})
sesion.belongsToMany(areaApoyo, {through: areaApoyoXSesion, foreignKey: "ID_SESION", otherKey: "ID_AREA_APOYO"})
sesion.belongsToMany(alumno, {through: areaApoyoXSesion, foreignKey: "ID_SESION", otherKey: "ID_ALUMNO"})
alumno.belongsToMany(sesion, {through: areaApoyoXSesion, foreignKey: "ID_ALUMNO", otherKey: "ID_SESION"})
alumno.belongsToMany(areaApoyo, {through: areaApoyoXSesion, foreignKey: "ID_ALUMNO", otherKey: "ID_AREA_APOYO"})
areaApoyoXSesion.belongsTo(areaApoyo,{foreignKey: "ID_AREA_APOYO"});
areaApoyoXSesion.belongsTo(sesion,{foreignKey: "ID_SESION"});
areaApoyoXSesion.belongsTo(alumno,{foreignKey: "ID_ALUMNO"}); */

module.exports = areaApoyoXSesion;