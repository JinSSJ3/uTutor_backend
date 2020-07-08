const controllers = {}
const Sequelize = require('sequelize')
let sequelize = require('../models/database');
let areaApoyo = require('../models/areaApoyo');

Op = Sequelize.Op;


controllers.listar = async (req, res) => { 
    try{
        const areasApoyo = await areaApoyo.findAll();
        res.status(201).json({areasApoyo:areasApoyo});         
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
    const {NOMBRE, TELEFONO, CORREO, CONTACTO} = req.body.areaApoyo; 
    try {
        const nombreRepetido = await areaApoyo.findOne({
            where: {NOMBRE: NOMBRE}
        })
        if(nombreRepetido){
            res.json({error: "Nombre repetido"})
            return;
        }

        const correoRepetido = await areaApoyo.findOne({
            where: {CORREO: CORREO}
        })
        if(correoRepetido){
            res.json({error: "Correo repetido"})
            return;
        }

        const nuevaAreaApoyo = await areaApoyo.create({
            NOMBRE: NOMBRE,
            TELEFONO: TELEFONO,
            CORREO: CORREO,
            CONTACTO: CONTACTO
        }, {transaction: transaccion})

        await transaccion.commit();
        res.status(201).json({areaApoyo: nuevaAreaApoyo}); 
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};


controllers.modificar = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();
    const {ID_AREA_APOYO, NOMBRE, TELEFONO, CORREO, CONTACTO} = req.body.areaApoyo;
    try {
        const repetido = await areaApoyo.findOne({
            where: {NOMBRE: NOMBRE, ID_AREA_APOYO: {[Op.not]: ID_AREA_APOYO}}
        })
        if(repetido){
            res.json({error: "Área de apoyo repetida"})
            return;
        }

        const correoRepetido = await areaApoyo.findOne({
            where: {CORREO: CORREO, ID_AREA_APOYO: {[Op.not]: ID_AREA_APOYO}}
        })
        if(correoRepetido){
            res.json({error: "Correo repetido"})
            return;
        }

        const etiquetaModificada = await areaApoyo.update({
            NOMBRE: NOMBRE,
            TELEFONO: TELEFONO,
            CORREO: CORREO,
            CONTACTO: CONTACTO
        }, {
            where: {ID_AREA_APOYO: ID_AREA_APOYO},
            transaction: transaccion
        })

        await transaccion.commit();
        res.status(201).json({areaApoyo: req.body.areaApoyo});
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

module.exports = controllers;