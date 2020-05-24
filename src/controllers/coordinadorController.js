const controllers = {}
const Sequelize = require("sequelize");
let sequelize = require('../models/database');
let coordinador = require('../models/usuario');
let rolXUsuario = require("../models/rolXUsuario");
let rol = require("../models/rol");
let usuarioXPrograma = require("../models/usuarioXPrograma");




controllers.listar = async (req, res) => { // lista a todos los coordinadores
    try{
        const coordinadores = await rolXUsuario.findAll({           
            include: [{
                model: rol,
                where: {DESCRIPCION: "Coordinador"}
            },{
                model:coordinador
            }],            
            where:{ESTADO: 1} // activo
        });
        res.status(201).json({coordinadores:coordinadores});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarPorPrograma = async (req, res) => { // lista a todos los coordinadores por programa
    try{
        const coordinadores = await rolXUsuario.findAll({           
            include: [{
                model: rol,
                where: {DESCRIPCION: "Coordinador"},
            },{
                model:coordinador,
                include: {
                    model: usuarioXPrograma,
                    where: {ID_PROGRAMA: req.params.id}
                },
                required: true
            }],            
            where:{ESTADO: 1} // activo
        });
        res.status(201).json({coordinadores:coordinadores});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.get = async (req, res) =>{ // devuelve los datos de un coordinador 
    try{
        const {id} = req.params;
        const data = await coordinador.findOne({
            include: [rol],
            where: {ID_USUARIO: id}
        })       
        res.status(201).json({coordinador:data});        
    }
    catch(error){
        res.json({error: error.message});
    }
}

controllers.buscarPorCodigo = async (req, res) =>{ // devuelve los datos de un alumno segun su codigo
    try{
        const data = await coordinador.findOne({
            where: {CODIGO: req.params.codigo},
            include: [rol]
        })        
        res.status(201).json({coordinador:data});        
    }
    catch(error){
        res.json({error: error.message});
    }
}

/**
 * @returns El nuevo coordinador creado en formato Json()
 * HTTP status code 201 significa que se creo exitosamente
 */
controllers.registrar = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "coordinador" en el cuerpo ("body") del request ("req")
     *  */ 
    const transaccion = await sequelize.transaction();
    const {NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, CONTRASENHA, IMAGEN, PROGRAMA} = req.body.coordinador; 
    //console.log("GOT: ", req.body.alumno);//solo para asegurarme de que el objeto llego al backend
    try {
        const nuevoCoordinador = await coordinador.create({
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
            const idRol = await rol.findOne({
                attributes:["ID_ROL"],
                where: {DESCRIPCION: "Coordinador"}
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
            await transaccion.commit();
            res.status(201).json({coordinador: result}); 
        })
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }    
};

controllers.modificar = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "coordinador" en el cuerpo ("body") del request ("req")
     *  */ 
    const transaccion = await sequelize.transaction();
    const {ID, NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, IMAGEN, PROGRAMA} = req.body.coordinador; 
    //console.log("GOT: ", req.body.alumno);//solo para asegurarme de que el objeto llego al backend
    try {
        const coordinadorModificado = await coordinador.update({
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
            await usuarioXPrograma.destroy({
                where:{ID_USUARIO: ID}            
            }, {transaction: transaccion})
                        
            for(element of PROGRAMA){
                const programaDeUsuario = await usuarioXPrograma.create({
                    ID_USUARIO: ID,
                    ID_PROGRAMA: element
                }, {transaction: transaccion})
            }                     
            await transaccion.commit();
            res.status(201).json({coordinador: req.body.coordinador}); 
        })
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
            where: {DESCRIPCION: "Coordinador"}
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