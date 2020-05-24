const Sequelize = require('sequelize');
let sequelize = require("./database");
const alumno = require('./alumno');
const procesoTutoria = require('./procesoTutoria');
const tutor = require('./tutor');


let nametable = 'ASIGNACION_TUTORIA';

let asignacionTutoria = sequelize.define(nametable,
    {
        ID_ASIGNACION:{
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
            ID_TUTOR:{
                type: Sequelize.INTEGER,
                references: {
                    model: "TUTOR",
                    key: "ID_TUTOR"
            }},
            ID_PROCESO_TUTORIA:{
                type: Sequelize.INTEGER,
                references: {
                    model: "PROCESO_TUTORIA",
                    key: "ID_PROCESO_TUTORIA"
            }},
        FECHA_ASIGNACION: Sequelize.DATE,
        ESTADO: Sequelize.TINYINT
    },
    {
    timestamps :false,
    freezeTableName: true,       
});

//usuario.belongsToMany(programa, {through: usuarioXPrograma, foreignKey: "ID_USUARIO", otherKey: "ID_PROGRAMA"})
//programa.belongsToMany(usuario, {through: usuarioXPrograma, foreignKey: "ID_PROGRAMA", otherKey: "ID_USUARIO"})
//usuarioXPrograma.belongsTo(programa,{foreignKey: "ID_PROGRAMA"});
//asignacionTutoria.belongsTo(alumno,{foreignKey: "ID_ALUMNO"});
asignacionTutoria.belongsTo(tutor,{foreignKey: "ID_TUTOR"});
asignacionTutoria.belongsTo(procesoTutoria,{foreignKey: "ID_PROCESO_TUTORIA"});

module.exports = asignacionTutoria;