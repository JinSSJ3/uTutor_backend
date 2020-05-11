const controllers = {}

let sequelize = require('../models/database');
let student = require('../models/student');

controllers.insert = async (req, res) =>{    
    const response = await sequelize.sync().then(function(){
        usuario.create({
            user: 'luis12',
            password: 'sfsdf56',
            name: 'Luis'
        })
         
    })
    .catch(error =>{
        return error;
    });
    

    res.json(response);
    
}

controllers.list = async (req, res) => {    
    const students = await student.findAll();
    res.json({students:students});     
    
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
    const {name, password, user} = req.body.student; 
    
    console.log("GOT: ", req.body.student);//solo para asegurarme de que el objeto llego al backend
    try {
        const newStudent = await student.create({
            name: name,
            user: user,
            password: password
        });
        res.status(201).json({student: newStudent});
    } catch (error) {
        res.json({error: error.message})
    }
    
};
    
    


module.exports = controllers;