const Sequelize = require('sequelize');
let sequelize = require("./database");

let nametable = 'BUZON_SUGERENCIAS';

let buzon = sequelize.define(nametable,{

    ID_SUGERENCIA:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    SUGERENCIA: Sequelize.STRING       
},
{
    timestamps :false,
    freezeTableName: true
});


module.exports = buzon;