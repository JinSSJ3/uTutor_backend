const controllers = {}

let sequelize = require('../models/database');
let student = require('../models/student');

sequelize.sync();



controllers.list = async (req, res) => {    
    try{
        const students = await student.findAll();
        res.status(201).json({students:students});         
    }    
    catch (error) {
        res.json({error: error.message})    
    }
};


/**
 * @returns El nuevo student creado en formato Json()
 * HTTP status code 201 significa que se creo exitosamente
 */
controllers.register = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "student" en el cuerpo ("body") del request ("req")
     *  */ 
    const {name, lastName, code,/* tag,*/mail, phone } = req.body.student; 
    console.log("GOT: ", req.body.student);//solo para asegurarme de que el objeto llego al backend
    try {
        const newStudent = await student.create({
            name: name,
            lastName: lastName,
            code: code,
            phone: phone,
            mail: mail,
           // tag: tag
        });        
        res.status(201).json({student: newStudent});
    } catch (error) {
        res.json({error: error.message})
    }
    
};   
    


module.exports = controllers;