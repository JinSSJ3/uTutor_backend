const Sequelize = require('sequelize');
let sequelize = require("./database");
let sesion = require("./sesion");

let nametable = 'COMPROMISO';

let compromiso = sequelize.define(nametable,{

    ID_COMPROMISO:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ID_SESION:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
            model: "SESION",
            key: "ID_SESION"
          }
    },
    DESCRIPCION: Sequelize.STRING,
    ESTADO: Sequelize.INTEGER 
    },
    {
    timestamps :false,
    freezeTableName: true
});

compromiso.belongsTo(sesion, {foreignKey:{name:"ID_SESION"}});
sesion.hasMany(compromiso, {foreignKey:{name:"ID_SESION"}});

module.exports = compromiso;