const controllers = {}
const Sequelize = require("sequelize");
let sequelize = require('../models/database');
let usuario = require('../models/usuario');
let rolXUsuarioXPrograma = require('../models/rolXUsuarioXPrograma')
let programa = require('../models/programa')
let rol = require('../models/rol')

const Op = Sequelize.Op;

controllers.buscarPorCorreo = async (req, res) => {
    try{
        const user = await usuario.findOne({
            where: {CORREO: req.params.correo},
            include: [{
                model: rolXUsuarioXPrograma,
                include: [{
                    model:programa,
                    include: [{
                        model: programa,
                        as: 'FACULTAD',
                        attributes: ["NOMBRE"]
                    }]
                }, rol]
            }]
        })
        res.status(201).json({usuario:user});
    }catch (error){
        res.json({error: error.message});    
    }
}

controllers.buscarPorCodigo = async (req, res) => {
    try{
        const user = await usuario.findOne({
            where: {CODIGO: req.params.codigo},
            include: [{
                model: rolXUsuarioXPrograma,
                include: [programa, rol]
            }]
        })
        res.status(201).json({usuario:user});
    }catch (error){
        res.json({error: error.message});    
    }
}

controllers.validarUsuarioUnico = async (req, res) => {
    try{
        const user = await usuario.findOne({
            where: {USUARIO: req.params.usuario}           
        })
        res.status(201).json({usuario:user});
    }catch (error){
        res.json({error: error.message});    
    }
}


controllers.listarRolesPorPrograma = async (req,res) => {
    try {
        const roles = await rolXUsuarioXPrograma.findAll({
            where: {
                ID_USUARIO: req.params.idUsuario,
                ID_PROGRAMA: req.params.idPrograma
            },
            include: [rol],
            attributes: []
        })
        res.status(201).json({roles: roles});
    }catch (error) {
        res.json({error: error.message})
    }
}


controllers.asignarRol = async (req,res) => {
    const transaccion = await sequelize.transaction();
    const {ID_USUARIO, ID_ROLES, ID_PROGRAMA} = req.body.asignacion;
    try {

        await rolXUsuarioXPrograma.destroy({
            where:{ID_USUARIO: ID_USUARIO, ID_PROGRAMA: ID_PROGRAMA},
            transaction: transaccion            
        })

        for (rol of ID_ROLES){
            const nuevaAsignacion = await rolXUsuarioXPrograma.create({
                ID_USUARIO: ID_USUARIO,
                ID_ROL: rol,
                ID_PROGRAMA: ID_PROGRAMA,
                ESTADO: 1
            }, {transaction: transaccion})

        }        

        await transaccion.commit();
        res.status(201).json({nuevaAsignacion: req.body.asignacion});
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
}

controllers.modificarPerfil = async (req,res) => {
    const transaccion = await sequelize.transaction();
    const {ID_USUARIO, TELEFONO, DIRECCION} = req.body.usuario;
    try {
        const usuarioModificado = await usuario.update({
            TELEFONO: TELEFONO,
            DIRECCION: DIRECCION
        }, {
            where: {ID_USUARIO: ID_USUARIO}
        }, {transaction: transaccion})

        await transaccion.commit();
        res.status(201).json({usuario: req.body.usuario});
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
}

controllers.login = async (req, res) => {
    const {USUARIO, CONTRASENHA} = req.body.usuario;
    try{
       const data = await usuario.findOne({ 
            where: {[Op.or]: {USUARIO: USUARIO, CORREO:USUARIO}}
        })
        .then(async result => { 
            let user = null
            if(result){
                if(await result.validPassword(CONTRASENHA)){
                    user = await usuario.findOne({
                        where: {[Op.or]: {USUARIO: USUARIO, CORREO:USUARIO}},
                        include: [{
                            model: rolXUsuarioXPrograma,
                            include: [{
                                model:programa,
                                include: [{
                                    model: programa,
                                    as: 'FACULTAD',
                                    attributes: ["NOMBRE"]
                                }]
                            }, rol],
                            where: {ESTADO: 1}
                        }]
                    })                
                }
            }
            res.status(201).json({usuario:user, idRol:user.ROL_X_USUARIO_X_PROGRAMAs[0].ROL.ID_ROL,rol:user.ROL_X_USUARIO_X_PROGRAMAs[0].ROL.DESCRIPCION});
        })
    }catch (error){
        res.json({error: error.message});    
    }
}


module.exports = controllers;