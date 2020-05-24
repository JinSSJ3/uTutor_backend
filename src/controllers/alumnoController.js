const controllers = {}
const Sequelize = require("sequelize");
let sequelize = require('../models/database');
let usuario = require('../models/usuario');
let alumno = require('../models/alumno');
let rolXUsuario = require("../models/rolXUsuario");
let rol = require("../models/rol");
let usuarioXPrograma = require("../models/usuarioXPrograma");
let asignacionTutoria = require("../models/asignacionTutoria")
let etiquetaXAlumno = require("../models/etiquetaXAlumno")



const Op = Sequelize.Op;

controllers.listar = async (req, res) => { // fetch all all studenst from DB
    try{
        const alumnos = await rolXUsuario.findAll({
            include: [{
                model:rol,
                where: {DESCRIPCION: "Alumno"}
            },{
                model: usuario,
                required: true
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
                include: {
                    model: usuario,
                    required: true
                },
                required: true
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


controllers.BuscarPorNombreTutoria = async (req, res) => { // Lista a los alumnos de un tutor de una tutoria determinado
    try{
        const alumnos = await asignacionTutoria.findAll({
            include: {
                model: alumno,
                include: {
                    model: usuario,
                    where: {[Op.or]: [{NOMBRE: {[Op.like]: '%' + req.params.nombre+ '%'}},
                                    {APELLIDOS:{[Op.like]: '%' + req.params.nombre+ '%'}}]},
                    required: true
                },
                required: true
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
                    where: {ID_PROGRAMA: req.params.programa},                    
                },
                required: true
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

controllers.buscarPorCodigo = async (req, res) =>{ // devuelve los datos de un alumno segun su codigo
    try{
        const data = await usuario.findOne({
            where: {CODIGO: req.params.codigo},
            include: [rol]
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
controllers.registrar = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "student" en el cuerpo ("body") del request ("req")
     *  */ 
    const transaccion = await sequelize.transaction();
    const {NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, CONTRASENHA, IMAGEN, PROGRAMA, ETIQUETA} = req.body.alumno; 
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

           
            for(element of PROGRAMA){
                const programaDeUsuario = await usuarioXPrograma.create({
                    ID_USUARIO: result.ID_USUARIO,
                    ID_PROGRAMA: element
                }, {transaction: transaccion})
            }

            for(element of ETIQUETA){
                const etiquetaDeAlumno = await etiquetaXAlumno.create({
                    ID_ALUMNO: result.ID_USUARIO,
                    ID_ETIQUETA: element
                }, {transaction: transaccion})
            }
            await transaccion.commit();
            res.status(201).json({alumno: result});            
        });
    } catch (error) {        
        await transaccion.rollback();
        res.json({error: error.message})
    }    

};

controllers.modificar = async (req, res) => {  
   
    const transaccion = await sequelize.transaction();
    const {ID, NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, IMAGEN, PROGRAMA, ETIQUETA} = req.body.alumno; 
    console.log(">>>>>>GOT: ", req.body.alumno);//solo para asegurarme de que el objeto llego al backend
    try {
        const nuevoAlumno = await usuario.update({
            USUARIO: USUARIO,
            NOMBRE: NOMBRE,
            APELLIDOS: APELLIDOS,
            CORREO: CORREO,
            CODIGO: CODIGO,
            TELEFONO: TELEFONO,
            DIRECCION: DIRECCION,
            IMAGEN: IMAGEN
        },{
            where: {ID_USUARIO: ID}
        }, {transaction: transaccion})
        .then(async result => {                   
            await etiquetaXAlumno.destroy({
                where:{ID_ALUMNO: ID}
            }, {transaction: transaccion})
            
            await usuarioXPrograma.destroy({
                where:{ID_USUARIO: ID}            
            }, {transaction: transaccion})

            for(element of PROGRAMA){
                const programaDeUsuario = await usuarioXPrograma.create({
                    ID_USUARIO: ID,
                    ID_PROGRAMA: element
                }, {transaction: transaccion})
            }

            for(element of ETIQUETA){
                const etiquetaDeAlumno = await etiquetaXAlumno.create({
                    ID_ALUMNO: ID,
                    ID_ETIQUETA: element
                }, {transaction: transaccion})
            }
            await transaccion.commit();
            res.status(201).json({alumno: req.body.alumno}); 
            
        }); 
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
};

controllers.eliminar = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();    
    try {
        const idRol = await rol.findOne({
            attributes:["ID_ROL"],
            where: {DESCRIPCION: "Alumno"}
        }, {transaction: transaccion})

        const coordinadorModificado = await rolXUsuario.update({
            ESTADO: 0            
        },{
            where: {
                ID_USUARIO: req.params.id,
                ID_ROL: idRol.ID_ROL
            }
        }, {transaction: transaccion})   
        await transaccion.commit()    
        res.status(201).json({status: "success"}) 
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

module.exports = controllers;