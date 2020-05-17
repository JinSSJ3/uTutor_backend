const controllers = {}

let sequelize = require('../models/database');
let tutor = require('../models/tutor');
let usuario = require('../models/usuario');

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
            where: {ID_TUTOR: id}
        })
        res.status(201).json({data:data});        
    }
    catch(error){
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