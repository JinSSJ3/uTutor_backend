const controllers = {}

let sequelize = require('../models/database');
let tutoria = require('../models/procesoTutoria');
let etiquetaXTutoria = require('../models/etiquetaXTutoria');
let etiqueta = require('../models/etiqueta');


controllers.listar = async (req, res) => { 
    try{
        const tutorias = await tutoria.findAll({
            include: [etiqueta],
            where: {ESTADO: 1}
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


controllers.get = async (req, res) =>{ // devuelve los datos de una tutoria 
    try{
        const {id} = req.params;
        const data = await tutoria.findOne({
            where: {ID_PROCESO_TUTORIA: id},
            include: [etiqueta]
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
    const {NOMBRE, DESCRIPCION, OBLIGATORIO, TUTOR_FIJO, GRUPAL, TUTOR_ASIGNADO, PERMANENTE, ETIQUETA, PROGRAMA, IMAGEN} = req.body.tutoria; 
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
            IMAGEN: IMAGEN
        }, {transaction: transaccion})
        .then(async result =>{
            ETIQUETA.forEach(async element => {
                const nuevaEtiquetaXTutoria = await etiquetaXTutoria.create({
                    ID_ETIQUETA: element,
                    ID_PROCESO_TUTORIA: result.ID_PROCESO_TUTORIA
                }, {transaction: transaccion})
            });            
        })     
        await transaccion.commit();
        res.status(201).json({tutoria: nuevaTutoria});   
    }catch (error) {
        //console.log("err0");
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

module.exports = controllers;