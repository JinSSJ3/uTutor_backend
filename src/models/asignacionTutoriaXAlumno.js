const Sequelize = require('sequelize');
let sequelize = require("./database");
const alumno = require('./alumno');
const asignacionTutoria = require('./asignacionTutoria');

let nametable = 'ASIGNACION_TUTORIA_X_ALUMNO';

let asignacionTutoriaXAlumno = sequelize.define(
    nametable,
    {},
    {
        timestamps: false,
        freezeTableName: true,
    }
);

alumno.belongsToMany(asignacionTutoria, {through: asignacionTutoriaXAlumno, foreignKey: "ID_ALUMNO", otherKey: "ID_ASIGNACION"})
asignacionTutoria.belongsToMany(alumno, {through: asignacionTutoriaXAlumno, foreignKey: "ID_ASIGNACION", otherKey: "ID_ALUMNO"})
asignacionTutoriaXAlumno.belongsTo(alumno,{foreignKey: "ID_ALUMNO"});
asignacionTutoriaXAlumno.belongsTo(asignacionTutoria,{foreignKey: "ID_ASIGNACION"});

module.exports = asignacionTutoriaXAlumno;