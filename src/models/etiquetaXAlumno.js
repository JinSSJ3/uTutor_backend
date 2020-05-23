const Sequelize = require('sequelize');
let sequelize = require("./database");
const etiqueta = require('./etiqueta');
const alumno = require('./usuario');


let nametable = 'ETIQUETA_X_ALUMNO';

let etiquetaXAlumno = sequelize.define(nametable,
    {},
    {
    timestamps :false,
    freezeTableName: true,       
});

etiqueta.belongsToMany(alumno, {through: etiquetaXAlumno, foreignKey: "ID_ETIQUETA", otherKey: "ID_ALUMNO"})
alumno.belongsToMany(etiqueta, {through: etiquetaXAlumno, foreignKey: "ID_ALUMNO", otherKey: "ID_ETIQUETA"})
etiquetaXAlumno.belongsTo(etiqueta,{foreignKey: "ID_ETIQUETA"});
etiquetaXAlumno.belongsTo(alumno,{foreignKey: "ID_ALUMNO"});

module.exports = etiquetaXAlumno;