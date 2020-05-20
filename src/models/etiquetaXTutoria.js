const Sequelize = require('sequelize');
let sequelize = require("./database");
const etiqueta = require('./etiqueta');
const procesoTutoria = require('./procesoTutoria');


let nametable = 'ETIQUETA_X_PROCESO_TUTORIA';

let etiquetaXTutoria = sequelize.define(nametable,
    {},
    {
    timestamps :false,
    freezeTableName: true,       
});

etiqueta.belongsToMany(procesoTutoria, {through: etiquetaXTutoria, foreignKey: "ID_ETIQUETA", otherKey: "ID_PROCESO_TUTORIA"})
procesoTutoria.belongsToMany(etiqueta, {through: etiquetaXTutoria, foreignKey: "ID_PROCESO_TUTORIA", otherKey: "ID_ETIQUETA"})
etiquetaXTutoria.belongsTo(etiqueta,{foreignKey: "ID_ETIQUETA"});
etiquetaXTutoria.belongsTo(procesoTutoria,{foreignKey: "ID_PROCESO_TUTORIA"});

module.exports = etiquetaXTutoria;