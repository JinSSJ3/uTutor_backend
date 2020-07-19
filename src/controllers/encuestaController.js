const controllers = {}

let sequelize = require('../models/database');
let encuesta = require('../models/encuesta');
const alumnoXSesion = require('../models/alumnoXSesion');
const sesion = require('../models/sesion');
const { Sequelize } = require('sequelize');
const procesoTutoria = require('../models/procesoTutoria');
const programa = require('../models/programa');
const { QueryTypes } = require('sequelize');


controllers.listarPorTutoria = async (req, res) => { 
    try{  // devuelve el promedio de c/campo de las encuestas wn cada proceso de tutoria de un programa 
        
        const encuestas = await sequelize.query("SELECT PROCESO_TUTORIA.NOMBRE PROCESO_TUTORIA,  AVG(SATISFACCION) SATISFACCION, AVG(UTILIDAD) UTILIDAD, SUM(UTILIZO_RECOMENDACIONES) UTILIZO_RECOMENDACIONES," +
        "SUM(SOLUCIONO_SITUACION) SOLUCIONO_SITUACION, SUM(RECOMENDARIA) RECOMENDARIA, COUNT(*) CANTIDAD" +
        " FROM ENCUESTA, ALUMNO_X_SESION, SESION, PROCESO_TUTORIA " +
        "WHERE ENCUESTA.ID_ALUMNO = ALUMNO_X_SESION.ID_ALUMNO AND ENCUESTA.ID_SESION = ALUMNO_X_SESION.ID_SESION " +
         "AND SESION.ID_SESION = ENCUESTA.ID_SESION AND ALUMNO_X_SESION.ID_SESION = SESION.ID_SESION AND PROCESO_TUTORIA.ID_PROCESO_TUTORIA = SESION.ID_PROCESO_TUTORIA " +
         "AND PROCESO_TUTORIA.ID_PROGRAMA = " + req.params.idPrograma +
        " GROUP BY PROCESO_TUTORIA.  ID_PROCESO_TUTORIA", { type: QueryTypes.SELECT });
        
        res.status(201).json({encuestas:encuestas});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarPorPrograma = async (req, res) => { 
    try{  // devuelve las encuestas de un programa
        const encuestas = await sequelize.query("SELECT CODIGO, CONCAT(USUARIO.NOMBRE,' ',USUARIO.APELLIDOS) NOMBRE, " +
        " UTILIDAD,CASE WHEN UTILIZO_RECOMENDACIONES=1 THEN 'SI' ELSE 'NO' END UTILIZO_RECOMENDACIONES, " +
        " CASE WHEN SOLUCIONO_SITUACION=1 THEN 'SI' ELSE 'NO' END SOLUCIONO_SITUACION," +
        " CASE WHEN RECOMENDARIA=1 THEN 'SI' ELSE 'NO' END RECOMENDARIA, " +
        " PROCESO_TUTORIA.NOMBRE PROCESO, PROGRAMA.NOMBRE PROGRAMA FROM ENCUESTA, SESION, PROCESO_TUTORIA, PROGRAMA, USUARIO " +
        " WHERE ENCUESTA.ID_SESION = SESION.ID_SESION AND SESION.ID_PROCESO_TUTORIA = PROCESO_TUTORIA.ID_PROCESO_TUTORIA " +
        " AND ID_USUARIO = ID_ALUMNO " +
        " AND PROCESO_TUTORIA.ID_PROGRAMA = PROGRAMA.ID_PROGRAMA AND PROGRAMA.ID_PROGRAMA =  " + req.params.idPrograma , { type: QueryTypes.SELECT });
        
        res.status(201).json({encuestas:encuestas});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.get = async (req, res) =>{ // devuelve los datos de una encuesta 
    try{    
        const data = await encuesta.findOne({
            where: {
                ID_SESION: req.params.idSesion,
                ID_ALUMNO: req.params.idAlumno
            }
        })

        res.status(201).json({encuesta:data});        
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
    const {ID_ALUMNO, ID_SESION, SATISFACCION, UTILIDAD, UTILIZO_RECOMENDACIONES, SOLUCIONO_SITUACION, RECOMENDARIA} = req.body.encuesta; 
  //  console.log("GOT: ", PROGRAMA);//solo para asegurarme de que el objeto llego al backend
    try {
        const nuevaEncuesta = await encuesta.create({
            ID_ALUMNO: ID_ALUMNO,
            ID_SESION: ID_SESION,
            SATISFACCION: SATISFACCION,
            UTILIDAD: UTILIDAD,
            UTILIZO_RECOMENDACIONES: UTILIZO_RECOMENDACIONES,
            SOLUCIONO_SITUACION: SOLUCIONO_SITUACION,
            RECOMENDARIA: RECOMENDARIA
        }, {transaction: transaccion})

        await transaccion.commit();
        res.status(201).json({encuesta: nuevaEncuesta}); 
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};


module.exports = controllers;