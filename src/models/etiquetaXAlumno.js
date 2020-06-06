const Sequelize = require('sequelize');
let sequelize = require("./database");
const etiqueta = require('./etiqueta');
const alumno = require('./alumno');


let nametable = 'ETIQUETA_X_ALUMNO';

let etiquetaXAlumno = sequelize.define(nametable,
    {},
    {
    timestamps :false,
    freezeTableName: true,       
});

// etiqueta.belongsToMany(alumno, {through: etiquetaXAlumno, foreignKey: "ID_ETIQUETA", otherKey: "ID_ALUMNO"})
// alumno.belongsToMany(etiqueta, {through: etiquetaXAlumno, foreignKey: "ID_ALUMNO", otherKey: "ID_ETIQUETA"})
// etiquetaXAlumno.belongsTo(etiqueta,{foreignKey: "ID_ETIQUETA"});
// etiquetaXAlumno.belongsTo(alumno,{foreignKey: "ID_ALUMNO"});
// etiqueta.hasMany(etiquetaXAlumno,{foreignKey: "ID_ETIQUETA"})

module.exports = etiquetaXAlumno;