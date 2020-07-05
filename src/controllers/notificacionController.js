const controllers = {}

let sequelize = require('../models/database');
let notificacion = require('../models/notificacion');
const sesion = require('../models/sesion');
const usuario = require('../models/usuario');

controllers.listar = async (req, res) => {  //lista las notificaciones activas de un usuario
    try{
        const notificaciones = await notificacion.findAll({
            where: {ID_RECEPTOR: req.params.idUsuario, ESTADO: 1},
            include:[{
                model: sesion
            }, {
                model: usuario,
                as: "EMISOR",
                attributes: ["NOMBRE", "APELLIDOS", "CORREO"]
            }],
            attributes: []
        });
        res.status(201).json({notificaciones:notificaciones});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};


controllers.modificar = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();
    try {
        const notificacionModificada = await notificacion.update({
            ESTADO: 0
        }, {
            where: {ID_RECEPTOR: req.params.idUsuario}
        }, {transaction: transaccion})

        await transaccion.commit();
        res.status(201).json({notificacion: "notificacion actualizada"});
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};


module.exports = controllers;