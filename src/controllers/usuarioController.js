const controllers = {}
const Sequelize = require("sequelize");
let sequelize = require('../models/database');
let tutor = require('../models/tutor');
let usuario = require('../models/usuario');
let rolXUsuarioXPrograma = require('../models/rolXUsuarioXPrograma')
let programa = require('../models/programa')
let rol = require('../models/rol')

const Op = Sequelize.Op;

controllers.buscarPorCorreo = async (req, res) => {
    try{
        const user = await usuario.findOne({
            where: {CORREO: req.params.correo},
            include: [{
                model: rolXUsuarioXPrograma,
                include: [programa, rol]
            }]
        })
        res.status(201).json({usuario:user});
    }catch (error){
        res.json({error: error.message});    
    }
}

controllers.buscarPorCodigo = async (req, res) => {
    try{
        const user = await usuario.findOne({
            where: {CODIGO: req.params.codigo},
            include: [{
                model: rolXUsuarioXPrograma,
                include: [programa, rol]
            }]
        })
        res.status(201).json({usuario:user});
    }catch (error){
        res.json({error: error.message});    
    }
}

controllers.validarUsuarioUnico = async (req, res) => {
    try{
        const user = await usuario.findOne({
            where: {USUARIO: req.params.usuario}           
        })
        res.status(201).json({usuario:user});
    }catch (error){
        res.json({error: error.message});    
    }
}


controllers.login = async (req, res) => {
    const {USUARIO, CONTRASENHA} = req.body.usuario;
    try{
       const data = await usuario.findOne({ 
            where: {[Op.or]: {USUARIO: USUARIO, CORREO:USUARIO}}
        })
        .then(async result => { 
            let user = null
            if(result){
                if(await result.validPassword(CONTRASENHA)){
                    user = await usuario.findOne({
                        where: {[Op.or]: {USUARIO: USUARIO, CORREO:USUARIO}},
                        include: [{
                            model: rolXUsuarioXPrograma,
                            include: [programa,rol],
                            where: {ESTADO: 1}
                        }]
                    })                
                }
            }
            res.status(201).json({usuario:user});
        })
    }catch (error){
        res.json({error: error.message});    
    }
}



 /*
 * @returns El nuevo student creado en formato Json()
 * HTTP status code 201 significa que se creo exitosamente
 */
/*
controllers.register = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "student" en el cuerpo ("body") del request ("req")
     *  */ 
/*
    const {names, lastnames, studentCode, email, phoneNumber, address, username, password} = req.body.student; 
    console.log("GOT: ", req.body.tutor);//solo para asegurarme de que el objeto llego al backend
    try {
        const newTutor = await tutor.create({
            USUARIO: username,
            CONTRASENHA: password,
            NOMBRES: names,
            APELLIDOS: lastnames,
            CORREO: email,
            CODIGO: studentCode,
            TELEFONO: phoneNumber,
            DIRECCION: address,
            IMAGEN: null,
            ESTADO: 1,
        });        
        res.status(201).json({tutor: newTutor});
    } catch (error) {
        res.json({error: error.message})
    }
    
};   
     */


module.exports = controllers;