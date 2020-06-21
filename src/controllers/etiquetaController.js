const controllers = {}

let sequelize = require('../models/database');
let etiqueta = require('../models/etiqueta');

controllers.listar = async (req, res) => { 
    try{
        const etiquetas = await etiqueta.findAll();
        res.status(201).json({etiquetas:etiquetas});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.get = async (req, res) =>{ // devuelve los datos de un alumno 
    try{    
        const data = await etiqueta.findOne({
            where: {ID_ETIQUETA: req.params.id}
        })

        res.status(201).json({etiqueta:data});        
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
    const {DESCRIPCION} = req.body.etiqueta; 
  //  console.log("GOT: ", PROGRAMA);//solo para asegurarme de que el objeto llego al backend
    try {
        const nuevaEtiqueta = await etiqueta.create({
            DESCRIPCION: DESCRIPCION
        }, {transaction: transaccion})

        await transaccion.commit();
        res.status(201).json({etiqueta: nuevaEtiqueta}); 
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};


controllers.modificar = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();
    const {ID, DESCRIPCION} = req.body.etiqueta;
    try {
        const etiquetaModificada = await etiqueta.update({
            DESCRIPCION: DESCRIPCION
        }, {
            where: {ID_ETIQUETA: ID}
        }, {transaction: transaccion})

        await transaccion.commit();
        res.status(201).json({etiqueta: req.body.etiqueta});
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

controllers.eliminar = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();   
    try {
        await etiqueta.destroy({
            where: {ID_ETIQUETA: req.params.id}
        }, {transaction: transaccion}) 
             
        await transaccion.commit();
        res.status(201).json({resultado: "success"}); 
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

module.exports = controllers;