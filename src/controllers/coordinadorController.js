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
                where: {DESCRIPCION: "Coordinador"}
            },{
                model:coordinador,
                include: {
                    model: usuarioXPrograma,
                    where: ID_ROL = Sequelize.col("ROL.ID_ROL")
                }
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
            
            PROGRAMA.forEach(async element => {
                const programaDeUsuario = await usuarioXPrograma.create({
                    ID_USUARIO: result.ID_USUARIO,
                    ID_PROGRAMA: element
                }, {transaction: transaccion})
            })      
        });          
        await transaccion.commit();
        res.status(201).json({coordinador: nuevoCoordinador});
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

module.exports = controllers;