const controllers = {}

let sequelize = require('../models/database');
let usuario = require('../models/usuario');
let alumno = require('../models/alumno');

sequelize.sync();



controllers.list = async (req, res) => { // fetch all all studenst from DB
    try{
        const alumnos = await alumno.findAll({
            include: [usuario] 
        });
        res.status(201).json({alumnos:alumnos});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.get = async (req, res) =>{ // devuelve los datos de un alumno 
    try{
        const {id} = req.params;
        const data = await student.findAll({
            where: {ID_ALUMNO: id}
        })
        res.status(201).json({data:data});        
    }
    catch(error){
        res.json({error: error.message});
    }

}


/**
 * @returns El nuevo student creado en formato Json()
 * HTTP status code 201 significa que se creo exitosamente
 */
controllers.register = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "student" en el cuerpo ("body") del request ("req")
     *  */ 
    const {names, lastnames, studentCode, email, phoneNumber, address, username, password} = req.body.student; 
    console.log("GOT: ", req.body.student);//solo para asegurarme de que el objeto llego al backend
    try {
        const newStudent = await student.create({
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
        res.status(201).json({student: newStudent});
    } catch (error) {
        res.json({error: error.message})
    }
    
};   
    


module.exports = controllers;