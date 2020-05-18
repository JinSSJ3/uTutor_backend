const controllers = {}

let sequelize = require('../models/database');
let tutor = require('../models/tutor');
let usuario = require('../models/usuario');
let rolXUsuario = require('../models/rolXUsuario');
let rol = require('../models/rol');

sequelize.sync();



controllers.list = async (req, res) => { // fetch all all tutors from DB
    try{
        const tutores = await tutor.findAll({
            include: {
                model: usuario,
               } 
        });
        res.status(201).json({tutores:tutores});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};


controllers.get = async (req, res) =>{ // devuelve los datos de un tutor
    try{
        const {id} = req.params;
        const data = await tutor.findAll({
            where: {ID_TUTOR: id},
            include: {
                model: usuario
               }
        })
        res.status(201).json({data:data});        
    }
    catch(error){
        res.json({error: error.message});
    }

}



controllers.register = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "student" en el cuerpo ("body") del request ("req")
     *  */ 

    const {name, lastnames, code, email, phoneNumber, address, username, password, imagen} = req.body.tutor; 
    console.log("GOT: ", req.body.tutor);//solo para asegurarme de que el objeto llego al backend
    try {
        const newUser = await usuario.create({
            USUARIO: username,
            CONTRASENHA: password,
            NOMBRE: name,
            APELLIDOS: lastnames,
            CORREO: email,
            CODIGO: code,
            TELEFONO: phoneNumber,
            DIRECCION: address,
            IMAGEN: imagen
        }).then(async result  => {
            const newTutor = await tutor.create({
                ID_TUTOR: result.ID_USUARIO
            })
            const idRol = await rol.findOne({
                attributes:["ID_ROL"],
                where: {DESCRIPCION: "Tutor"}
            })
            const newRolUsuario = await rolXUsuario.create({
                ID_USUARIO: result.ID_USUARIO,
                ESTADO: '1',
                ID_ROL: idRol.ID_ROL
            })
        });
        res.status(201).json({tutor: newUser});
        
    } catch (error) {
        res.json({error: error.message})
    }
    
};   
     


module.exports = controllers;