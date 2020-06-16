const controllers = {}
const Sequelize = require("sequelize");
let sequelize = require('../models/database');
let coordinador = require('../models/usuario');
//let rolXUsuario = require("../models/rolXUsuario");
let rol = require("../models/rol");
let rolXUsuarioXPrograma = require("../models/rolXUsuarioXPrograma");
let programa = require("../models/programa");


const Op = Sequelize.Op;

controllers.listarCoordinadoresFacultad = async (req, res) => { // lista a todos los coordinadores de facultad
    try{
        const coordinadores = await coordinador.findAll({           
            include: [{
                model: rolXUsuarioXPrograma,
                where: {ESTADO: 1},
                include:[{
                    model: rol,
                    where: {DESCRIPCION: "Coordinador Facultad"}
                }, programa]
            }],           
        });
        res.status(201).json({coordinadores:coordinadores});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};


controllers.listarCoordinadoresPrograma = async (req, res) => { 
    try{              // lista a todos los coordinadores de programa de una facultad en especifico
        const coordinadores = await coordinador.findAll({           
            include: [{
                model: rolXUsuarioXPrograma,
                where: {ESTADO: 1},
                include:[{
                    model: rol,
                    where: {DESCRIPCION: "Coordinador Programa"}
                }, {
                    model: programa,
                    where: {ID_FACULTAD: req.params.idFacultad},
                    required: true
                }],
                attributes: ["ESTADO"]
            }],           
        });
        res.status(201).json({coordinadores:coordinadores});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarPorPrograma = async (req, res) => { // lista a todos los coordinadores por programa
    try{
        const coordinadores = await rolXUsuarioXPrograma.findAll({           
            include: [{
                model: rol,
                where: {DESCRIPCION: {[Op.like]: "%Coordinador%"}},
                required: true
            },{
                model:coordinador,
                required: true
            }],
            where: {
                ID_PROGRAMA: req.params.id,
                ESTADO: 1  // activo
            }           
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
            include: [rol, programa],
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
            include: [rol, programa]
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
controllers.registrarCoordinadorPrograma = async (req, res) => {  
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
                where: {DESCRIPCION: "Coordinador Programa"}
            }, {transaction: transaccion})

/*             const rolDeUsuario = await rolXUsuario.create({
                ID_USUARIO: result.ID_USUARIO,
                ID_ROL: idRol.ID_ROL
            }, {transaction: transaccion}) */
                        
            for(element of PROGRAMA){
                const programaDeUsuario = await rolXUsuarioXPrograma.create({
                    ID_USUARIO: result.ID_USUARIO,
                    ID_PROGRAMA: element,
                    ID_ROL: idRol.ID_ROL,
                    ESTADO: '1'
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

controllers.registrarCoordinadorFacultad = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "coordinador" en el cuerpo ("body") del request ("req")
     *  */ 
    const transaccion = await sequelize.transaction();
    const {NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, CONTRASENHA, IMAGEN, FACULTAD} = req.body.coordinador; 
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
                where: {DESCRIPCION: "Coordinador Facultad"}
            }, {transaction: transaccion})

/*             const rolDeUsuario = await rolXUsuario.create({
                ID_USUARIO: result.ID_USUARIO,
                ID_ROL: idRol.ID_ROL
            }, {transaction: transaccion}) */
                        
            for(element of FACULTAD){
                const programaDeUsuario = await rolXUsuarioXPrograma.create({
                    ID_USUARIO: result.ID_USUARIO,
                    ID_PROGRAMA: element,
                    ID_ROL: idRol.ID_ROL,
                    ESTADO: '1'
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

controllers.modificarCoordinadorPrograma = async (req, res) => {  
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

            const idRol = await rol.findOne({
                attributes:["ID_ROL"],
                where: {DESCRIPCION: "Coordinador Programa"}
            }, {transaction: transaccion})

            await rolXUsuarioXPrograma.destroy({
                where:{ID_USUARIO: ID, ID_ROL: idRol.ID_ROL}            
            }, {transaction: transaccion})
                        
            for(element of PROGRAMA){
                const programaDeUsuario = await rolXUsuarioXPrograma.create({
                    ID_USUARIO: result.ID_USUARIO,
                    ID_PROGRAMA: element,
                    ID_ROL: idRol.ID_ROL
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

controllers.modificarCoordinadorFacultad = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "coordinador" en el cuerpo ("body") del request ("req")
     *  */ 
    const transaccion = await sequelize.transaction();
    const {ID, NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, IMAGEN, FACULTAD} = req.body.coordinador; 
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

            const idRol = await rol.findOne({
                attributes:["ID_ROL"],
                where: {DESCRIPCION: "Coordinador Facultad"}
            }, {transaction: transaccion})

            await rolXUsuarioXPrograma.destroy({
                where:{ID_USUARIO: ID, ID_ROL: idRol.ID_ROL}            
            }, {transaction: transaccion})
                        
            for(element of FACULTAD){
                const programaDeUsuario = await rolXUsuarioXPrograma.create({
                    ID_USUARIO: result.ID_USUARIO,
                    ID_PROGRAMA: element,
                    ID_ROL: idRol.ID_ROL
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

controllers.eliminarCoordinadorPrograma = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();    
    try {
        const idRol = await rol.findOne({
            attributes:["ID_ROL"],
            where: {DESCRIPCION: "Coordinador Programa"}
        }, {transaction: transaccion})

        const coordinadorModificado = await rolXUsuarioXPrograma.update({
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

controllers.eliminarCoordinadorFacultad = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();    
    try {
        const idRol = await rol.findOne({
            attributes:["ID_ROL"],
            where: {DESCRIPCION: "Coordinador Facultad"}
        }, {transaction: transaccion})

        const coordinadorModificado = await rolXUsuarioXPrograma.update({
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