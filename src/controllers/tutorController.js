const controllers = {}

let sequelize = require('../models/database');
let tutor = require('../models/tutor');
let usuario = require('../models/usuario');
let rolXUsuario = require('../models/rolXUsuario');
let rol = require('../models/rol');
let usuarioXPrograma = require('../models/usuarioXPrograma');

//sequelize.sync();



controllers.list = async (req, res) => { // fetch all all tutors from DB
    try{
        const tutores = await tutor.findAll({
            include: {
                model: usuario,
               } 
        });
        res.status(201).json({tutores:tutores});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};


controllers.get = async (req, res) =>{ // devuelve los datos de un tutor
    try{
        const {id} = req.params;
        const data = await usuario.findOne({
            where: {ID_USUARIO: id},
            include: [{
                model: usuarioXPrograma,
                attributes: ['ID_PROGRAMA']
            }]
        })
        res.status(201).json({data:data});        
    }
    catch(error){
        res.json({error: error.message});
    }

}

controllers.register = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "student" en el cuerpo ("body") del request ("req")
     *  */ 
    const transaccion = await sequelize.transaction();
    const {NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, CONTRASENHA, IMAGEN, PROGRAMA} = req.body.tutor; 
    console.log("GOT: ", req.body.tutor);//solo para asegurarme de que el objeto llego al backend
    try {
        const newUser = await usuario.create({
            USUARIO: USUARIO,
            CONTRASENHA: CONTRASENHA,
            NOMBRE: NOMBRE,
            APELLIDOS: APELLIDOS,
            CORREO: CORREO,
            CODIGO: CODIGO,
            TELEFONO: TELEFONO,
            DIRECCION: DIRECCION,
            IMAGEN: IMAGEN
        }, {transaction: transaccion}).then(async result  => {
            const newTutor = await tutor.create({
                ID_TUTOR: result.ID_USUARIO
            }, {transaction: transaccion})
            const idRol = await rol.findOne({
                attributes:["ID_ROL"],
                where: {DESCRIPCION: "Tutor"}
            })
            const newRolUsuario = await rolXUsuario.create({
                ID_USUARIO: result.ID_USUARIO,
                ESTADO: '1',
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
        res.status(201).json({tutor: newUser});
        
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

controllers.modificar = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    const {ID_TUTOR,NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, IMAGEN, PROGRAMA} = req.body.tutor; 
    console.log("GOT: ", req.body.tutor);//solo para asegurarme de que el objeto llego al backend
    
    try {
        const modifTutor = await usuario.update({
            USUARIO: USUARIO,
            NOMBRE: NOMBRE,
            APELLIDOS: APELLIDOS,
            CORREO: CORREO,
            CODIGO: CODIGO,
            TELEFONO: TELEFONO,
            DIRECCION: DIRECCION,
            IMAGEN: IMAGEN
        },{
            where: {ID_USUARIO: ID_TUTOR}
        }, {transaction: transaccion})
        .then(async result => {                   
            
            await usuarioXPrograma.destroy({
                where:{ID_USUARIO: ID_TUTOR}            
            }, {transaction: transaccion})

            for(element of PROGRAMA){
                const programaDeUsuario = await usuarioXPrograma.create({
                    ID_USUARIO: ID_TUTOR,
                    ID_PROGRAMA: element
                }, {transaction: transaccion})
            }

            await transaccion.commit();
            res.status(201).json({alumno: req.body.alumno}); 
            
        }); 
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};
     


module.exports = controllers;