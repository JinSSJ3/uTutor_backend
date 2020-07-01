const controllers = {}
const Sequelize =  require("sequelize");
let sequelize = require('../models/database');
let tutoria = require('../models/procesoTutoria');
let etiquetaXTutoria = require('../models/etiquetaXTutoria');
let etiqueta = require('../models/etiqueta');
let programa = require('../models/programa');
let asignacionTutoria = require('../models/asignacionTutoria');
let asignacionTutoriaXAlumno = require('../models/asignacionTutoriaXAlumno');


controllers.listar = async (req, res) => { 
    try{
        const tutorias = await tutoria.findAll({
            include: [etiqueta, programa],
            where: {ESTADO: 1}
        });
        res.status(201).json({tutoria:tutorias});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarTutoriasFijasPorPrograma = async (req, res) => { 
    try{
        const tutorias = await tutoria.findAll({
            include: [etiqueta],
            where: {
                ESTADO: 1,
                ID_PROGRAMA: req.params.idPrograma,
                TUTOR_FIJO:1
            }
        });
        res.status(201).json({tutoria:tutorias});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
}; 

controllers.listarPorPrograma = async (req, res) => { 
    try{
        const tutorias = await tutoria.findAll({
            include: [etiqueta],
            where: {
                ESTADO: 1,
                ID_PROGRAMA: req.params.id
            }
        });
        res.status(201).json({tutoria:tutorias});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarPorProgramaYTutor = async (req, res) => { 
    try{
        const tutorias = await asignacionTutoria.findAll({
            include: {
                model: tutoria,
                as: "PROCESO_TUTORIA",
                where: {ID_PROGRAMA:req.params.idPrograma}
            },
            where: {
                ESTADO: 1,
                ID_TUTOR: req.params.idTutor
            },
            attributes: [Sequelize.col("PROCESO_TUTORIA.*")],
            group: ["ID_PROCESO_TUTORIA"]
        });
        res.status(201).json({tutoria:tutorias});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.get = async (req, res) =>{ // devuelve los datos de una tutoria 
    try{
        const {id} = req.params;
        const data = await tutoria.findOne({
            where: {ID_PROCESO_TUTORIA: id},
            include: [etiqueta,programa]
        })
        res.status(201).json({tutoria:data});        
    }
    catch(error){
        res.json({error: error.message});
    }
}


/**
 * @returns La nueva tutoria creado en formato Json()
 * HTTP status code 201 significa que se creo exitosamente
 */
controllers.registrar = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio una "tutoria" en el cuerpo ("body") del request ("req")
     *  */ 
    const transaccion = await sequelize.transaction();
    const {NOMBRE, DESCRIPCION, OBLIGATORIO, TUTOR_FIJO, GRUPAL, TUTOR_ASIGNADO, PERMANENTE, ETIQUETA, PROGRAMA, DURACION} = req.body.tutoria; 
  //  console.log("GOT: ", PROGRAMA);//solo para asegurarme de que el objeto llego al backend
    try {
        const nuevaTutoria = await tutoria.create({
            NOMBRE: NOMBRE,
            DESCRIPCION: DESCRIPCION,
            OBLIGATORIO: OBLIGATORIO,
            TUTOR_FIJO: TUTOR_FIJO,
            GRUPAL: GRUPAL,
            TUTOR_ASIGNADO: TUTOR_ASIGNADO,
            PERMANENTE: PERMANENTE,
            ID_PROGRAMA: PROGRAMA,
            DURACION: DURACION
        }, {transaction: transaccion})
        .then(async result =>{          
            for(element of ETIQUETA){
                const nuevaEtiquetaXTutoria = await etiquetaXTutoria.create({
                    ID_ETIQUETA: element,
                    ID_PROCESO_TUTORIA: result.ID_PROCESO_TUTORIA
                }, {transaction: transaccion})
            }
            await transaccion.commit();
            res.status(201).json({tutoria: result});  
        })
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};


controllers.modificar = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();
    const {ID, NOMBRE, DESCRIPCION, OBLIGATORIO, TUTOR_FIJO, GRUPAL, TUTOR_ASIGNADO, PERMANENTE, ETIQUETA, PROGRAMA, DURACION} = req.body.tutoria; 
  //  console.log("GOT: ", PROGRAMA);//solo para asegurarme de que el objeto llego al backend
    try {
        const tutoriaModificada = await tutoria.update({
            NOMBRE: NOMBRE,
            DESCRIPCION: DESCRIPCION,
            OBLIGATORIO: OBLIGATORIO,
            TUTOR_FIJO: TUTOR_FIJO,
            GRUPAL: GRUPAL,
            TUTOR_ASIGNADO: TUTOR_ASIGNADO,
            PERMANENTE: PERMANENTE,
            ID_PROGRAMA: PROGRAMA,
            DURACION: DURACION
        }, {
            where: {ID_PROCESO_TUTORIA: ID}
        }, {transaction: transaccion})
        .then(async result =>{
            await etiquetaXTutoria.destroy({
                where: {ID_PROCESO_TUTORIA: ID}
            }, {transaction: transaccion})
            
            for(element of ETIQUETA){
                const nuevaEtiquetaXTutoria = await etiquetaXTutoria.create({
                    ID_ETIQUETA: element,
                    ID_PROCESO_TUTORIA: ID
                }, {transaction: transaccion})
            }
            await transaccion.commit();
            res.status(201).json({tutoria: req.body.tutoria});             
        })
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

controllers.eliminar = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();   
    try {
        const tutoriaEliminada = await tutoria.update({
            ESTADO: 0
        }, {
            where: {ID_PROCESO_TUTORIA: req.params.id}
        }, {transaction: transaccion})       
        await transaccion.commit();
        res.status(201).json({resultado: "success"}); 
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

controllers.listarTutoriasVariablesPorPrograma = async (req, res) => { 
    try{
        const tutorias = await tutoria.findAll({
            include: [etiqueta],
            where: {
                ESTADO: 1,
                ID_PROGRAMA: req.params.idPrograma,
                TUTOR_FIJO:0
            }
        });
        res.status(201).json({tutoria:tutorias});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarTutoriasFijasAsignadasAPorAlumno = async (req, res) => { 
    try{
        const tutorias = await tutoria.findAll({
            include: [etiqueta,{
                model: asignacionTutoria,
                where: {ESTADO: 1},
                include:[{
                    model:asignacionTutoriaXAlumno,
                    where: {
                        ID_ALUMNO:req.params.idAlumno,
                        SOLICITUD:1
                    },
                    attributes: []
                }],
                attributes: ["ID_TUTOR"]
            }],
            where: {
                ESTADO: 1,
                ID_PROGRAMA: req.params.idPrograma,
                TUTOR_FIJO:1
            }
        });
        res.status(201).json({tutoria:tutorias});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

module.exports = controllers;