const Sequelize = require('sequelize');
let sequelize = require("./database");
let areaApoyo = require("./areaApoyo");
let sesion = require("./sesion");
let alumnoXSesion = require("./alumnoXSesion");

let nametable = 'AREA_APOYO_X_SESION';

let areaApoyoXSesion = sequelize.define(nametable,{
  },
  {
      timestamps :false,
      freezeTableName: true
  });

areaApoyo.belongsToMany(sesion, {through: areaApoyoXSesion, foreignKey: "ID_AREA_APOYO", otherKey: "ID_SESION"})
sesion.belongsToMany(areaApoyo, {through: areaApoyoXSesion, foreignKey: "ID_SESION", otherKey: "ID_AREA_APOYO"})
alumnoXSesion.belongsTo(areaApoyo,{foreignKey: "ID_AREA_APOYO"});
alumnoXSesion.belongsTo(sesion,{foreignKey: "ID_SESION"});

module.exports = areaApoyoXSesion;