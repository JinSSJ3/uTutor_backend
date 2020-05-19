const controllers = {}

let sequelize = require('../models/database');
let usuario = require('../models/usuario');
let alumno = require('../models/alumno');
let rolXUsuario = require("../models/rolXUsuario");
let rol = require("../models/rol");
let usuarioXPrograma = require("../models/usuarioXPrograma");
let asignacionTutoria = require("../models/asignacionTutoria")





controllers.list = async (req, res) => { // fetch all all studenst from DB
    try{
        const alumnos = await rolXUsuario.findAll({
            include: [{
                model:rol,
                where: {DESCRIPCION: "Alumno"}
            },{
                model: usuario
            }],
            where: {ESTADO: 1}
        });
        res.status(201).json({alumnos:alumnos});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarPorTutoria = async (req, res) => { // Lista a los alumnos de un tutor de una tutoria determinado
    try{
        const alumnos = await asignacionTutoria.findAll({
            include: {
                model: alumno,
                include: [usuario]
            },
            where: {
                ESTADO: 1,
                ID_TUTOR: req.params.tutor,
                ID_PROCESO_TUTORIA: req.params.tutoria
            }
        });
        res.status(201).json({alumnos:alumnos});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarPorPrograma = async (req, res) => { // Lista a los alumnos de un programa determinado
    try{
        const alumnos = await rolXUsuario.findAll({
            include: [{
                model:rol,
                where: {DESCRIPCION: "Alumno"}
            },{
                model: usuario,
                include: {
                    model: usuarioXPrograma,
                    where: {ID_PROGRAMA: req.params.id}
                }
            }],
            where: {ESTADO: 1}
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
        const data = await usuario.findOne({
            where: {ID_USUARIO: id},
            include: [rol]
        })
        /*const data = await usuario.findOne({  validar contrasena
            where: {ID_USUARIO: id}
        })
        .then(async result => { 
            console.log(await result.validPassword("contra"));
        })*/
        
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
    const transaccion = await sequelize.transaction();
    const {NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, CONTRASENHA, IMAGEN, PROGRAMA} = req.body.alumno; 
    console.log(">>>>>>GOT: ", req.body.alumno);//solo para asegurarme de que el objeto llego al backend
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
        }, {transaction: transaccion})
        .then(async result => {
            const nuevo = await alumno.create({
                ID_ALUMNO: result.ID_USUARIO
            }, {transaction: transaccion})                     
           
            const idRol = await rol.findOne({
                attributes:["ID_ROL"],
                where: {DESCRIPCION: "Alumno"}
            }, {transaction: transaccion})

            const rolDeUsuario = await rolXUsuario.create({
                ID_USUARIO: result.ID_USUARIO,
                ID_ROL: idRol.ID_ROL
            }, {transaction: transaccion})         

            PROGRAMA.forEach(async element => {
                const programaDeUsuario = await usuarioXPrograma.create({
                    ID_USUARIO: result.ID_USUARIO,
                    ID_PROGRAMA: element
                }, {transaction: transaccion})
            })
            
        });          
        await transaccion.commit();
        res.status(201).json({alumno: nuevoAlumno});
    } catch (error) {
        //console.log("err0");
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

module.exports = controllers;