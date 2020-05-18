const Sequelize = require('sequelize');
let sequelize = require("./database");
const bcrypt = require("bcrypt");

let nametable = 'USUARIO';

let usuario = sequelize.define(nametable,{

    ID_USUARIO:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    USUARIO: Sequelize.STRING,
    CONTRASENHA: Sequelize.STRING,
    NOMBRE: Sequelize.STRING,
    APELLIDOS: Sequelize.STRING,
    CORREO:Sequelize.STRING,
    CODIGO: Sequelize.STRING,
    TELEFONO: Sequelize.STRING,
    DIRECCION: Sequelize.STRING,
    IMAGEN: Sequelize.BLOB    
    },
    {
    timestamps :false,
    freezeTableName: true,
    hooks:{
        beforeCreate: async (user, options) => {
            const salt = await bcrypt.genSalt(10); 
            user.CONTRASENHA = await bcrypt.hash(user.CONTRASENHA, salt);
        }
    }   
});

usuario.prototype.validPassword = async function(password) {
    console.log(password,"   ", this.CONTRASENHA);
    return bcrypt.compare(password, this.CONTRASENHA);
}

module.exports = usuario;