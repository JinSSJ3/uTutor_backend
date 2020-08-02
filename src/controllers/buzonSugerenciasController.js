const controllers = {}
const Sequelize = require('sequelize')
let sequelize = require('../models/database');
let buzon = require('../models/buzonSugerencias');

Op = Sequelize.Op;


controllers.listar = async (req, res) => { 
    try{
        const sugerencias = await buzon.findAll();
        res.status(201).json({sugerencias:sugerencias});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};


/**
 * @returns La nueva tutoria creado en formato Json()
 * HTTP status code 201 significa que se creo exitosamente
 */
controllers.registrar = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    try {
        const nuevaSugerencia = await buzon.create({
            SUGERENCIA: req.body.sugerencia
        }, {transaction: transaccion})

        await transaccion.commit();
        res.status(201).json({sugerencia: nuevaSugerencia}); 
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};


module.exports = controllers;