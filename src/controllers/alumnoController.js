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
        const data = await alumno.findAll({
            where: {ID_ALUMNO: id},
            include: [usuario]
        })
        res.status(201).json({alumno:data});        
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
    const {NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, CONTRASENHA, IMAGEN} = req.body.alumno; 
    console.log("GOT: ", req.body.alumno);//solo para asegurarme de que el objeto llego al backend
    try {
        const nuevoAlumno = await usuario.create({
            USUARIO: USUARIO,
            CONTRASENHA: CONTRASENHA,
            NOMBRE: NOMBRE,
            APELLIDOS: APELLIDOS,
            CORREO: CORREO,
            CODIGO: CODIGO,
            TELEFONO: TELEFONO,
            DIRECCION: DIRECCION,
            IMAGEN: IMAGEN
        })
        .then(result => {
            const nuevo = alumno.create({
                ID_ALUMNO: result.ID_USUARIO
            })
        });          
        res.status(201).json({alumno: nuevoAlumno});
    } catch (error) {
        res.json({error: error.message})
    }
    
};   
    


module.exports = controllers;