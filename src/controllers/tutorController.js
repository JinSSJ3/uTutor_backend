const controllers = {}

var nodemailer = require('nodemailer');

let sequelize = require('../models/database');
let tutor = require('../models/tutor');
let usuario = require('../models/usuario');
//let rolXUsuario = require('../models/rolXUsuario');
let rol = require('../models/rol');
let rolXUsuarioXPrograma = require('../models/rolXUsuarioXPrograma');
let programa = require('../models/programa')
let asignacionTutoria = require('../models/asignacionTutoria')
let asignacionTutoriaXAlumno = require('../models/asignacionTutoriaXAlumno');
let notificacion = require('../models/notificacion');
const { Sequelize } = require('sequelize');

//sequelize.sync();



controllers.listarTutorAsignado = async (req, res) => { // lista el tutor asignado a un alumno en cierto proceso de tutoria
    try{
        const tutores = await tutor.findAll({
            include: [{
                model: usuario,
                include: {
                    model: rolXUsuarioXPrograma, 
                    where: {
                        ESTADO: 1
                    },
                    include: {
                        model: rol,
                        where: {DESCRIPCION: "Tutor"},
                        attributes: []
                    },
                    attributes: []
                }
               },{
                   model: asignacionTutoria,
                   where: {
                       ID_TUTOR: Sequelize.col("TUTOR.ID_TUTOR"),
                       ID_PROCESO_TUTORIA: req.params.idTutoria,
                       ESTADO: 1
                   },
                   include: {
                       model: asignacionTutoriaXAlumno,
                       where: {
                           ID_ALUMNO: req.params.idAlumno,
                           SOLICITUD: 1
                       },
                       attributes: []
                   },
                   attributes: []
               }], 
        });
        res.status(201).json({tutor:tutores});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};


controllers.list = async (req, res) => { // fetch all all tutors from DB
    try{
        const tutores = await tutor.findAll({
            include: {
                model: usuario,
                include: {model: rolXUsuarioXPrograma, where: {'ESTADO': 1}},
               } 
        });
        res.status(201).json({tutores:tutores});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};


controllers.listarPorPrograma = async (req, res) => { // fetch all all tutors from DB
    try{
        const tutores = await tutor.findAll({
            include: {
                model: usuario,
                required: true,
                include: [{
                    model: rolXUsuarioXPrograma,
                    where: {
                        ID_PROGRAMA: req.params.idPrograma,
                        ESTADO: 1
                    },
                    required: true,
                    include:{
                        model: rol,
                        where: {DESCRIPCION: "TUTOR"},
                        required: true
                    }
                }]
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
                model: rolXUsuarioXPrograma,
                attributes: ['ID_PROGRAMA'],
                include: [{
                    model: programa,
                    attributes: ['NOMBRE']
                }]
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
            const validacionCodigo = await usuario.findOne({
                where: {CODIGO: CODIGO},
                include:[{
                    model: rolXUsuarioXPrograma,
                    attributes: ["ESTADO"],
                    where: {ESTADO: 1},
                    include: [{
                        model:programa,
                        attributes: ["ID_PROGRAMA", "NOMBRE"],
                        include: {
                            model: programa,
                            as: "FACULTAD",
                            attributes: ["ID_FACULTAD", "NOMBRE"]
                        }
                    }, rol]
                }]
            })

            const validacionCorreo = await usuario.findOne({
                where:{CORREO: CORREO},
                include:[{
                    model: rolXUsuarioXPrograma,
                    attributes: ["ESTADO"],
                    where: {ESTADO: 1},
                    include: [{
                        model:programa,
                        attributes: ["ID_PROGRAMA", "NOMBRE"],
                        include: {
                            model: programa,
                            as: "FACULTAD",
                            attributes: ["ID_FACULTAD", "NOMBRE"]
                        }
                    }, rol]
                }]
            })

            if (!validacionCodigo && !validacionCorreo){
                const newTutor = await tutor.create({
                    ID_TUTOR: result.ID_USUARIO
                }, {transaction: transaccion})
                const idRol = await rol.findOne({
                    attributes:["ID_ROL"],
                    where: {DESCRIPCION: "Tutor"}
                })
        /*             const newRolUsuario = await rolXUsuario.create({
                    ID_USUARIO: result.ID_USUARIO,
                    ESTADO: '1',
                    ID_ROL: idRol.ID_ROL
                }, {transaction: transaccion}) */

                for(ele of PROGRAMA) {
                    const programaDeUsuario = await rolXUsuarioXPrograma.create({
                        ID_USUARIO: result.ID_USUARIO,
                        ID_PROGRAMA: ele,
                        ESTADO: '1',
                        ID_ROL: idRol.ID_ROL
                    }, {transaction: transaccion})
                }
                await transaccion.commit();
                res.status(201).json({tutor: result});
            }else{
                await transaccion.rollback();
                if(validacionCodigo && validacionCorreo){
                    res.json({error: "Codigo y correo repetido", usuario: validacionCodigo})
                }else if(validacionCodigo){
                    res.json({error: "Codigo repetido", usuario: validacionCodigo})
                }else if(validacionCorreo){
                    res.json({error: "Correo repetido", usuario: validacionCorreo})
                }
            }
        });
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

controllers.modificar = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    const {ID_TUTOR,NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, IMAGEN, PROGRAMA} = req.body.tutor; 
    // console.log("GOT: ", req.body.tutor);//solo para asegurarme de que el objeto llego al backend
    
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
            const validacionCodigo = await usuario.findOne({
                where: {ID_USUARIO: {[Op.not]: ID_TUTOR}, CODIGO: CODIGO},
                include:[{
                    model: rolXUsuarioXPrograma,
                    attributes: ["ESTADO"],
                    where: {ESTADO: 1},
                    include: [{
                        model:programa,
                        attributes: ["ID_PROGRAMA", "NOMBRE"],
                        include: {
                            model: programa,
                            as: "FACULTAD",
                            attributes: ["ID_FACULTAD", "NOMBRE"]
                        }
                    }, rol]
                }]
            })

            const validacionCorreo = await usuario.findOne({
                where:{ID_USUARIO: {[Op.not]: ID_TUTOR}, CORREO: CORREO},
                include:[{
                    model: rolXUsuarioXPrograma,
                    attributes: ["ESTADO"],
                    where: {ESTADO: 1},
                    include: [{
                        model:programa,
                        attributes: ["ID_PROGRAMA", "NOMBRE"],
                        include: {
                            model: programa,
                            as: "FACULTAD",
                            attributes: ["ID_FACULTAD", "NOMBRE"]
                        }
                    }, rol]
                }]
            })

            if (!validacionCodigo && !validacionCorreo){             
            
                const idRol = await rol.findOne({
                    attributes:["ID_ROL"],
                    where: {DESCRIPCION: "Tutor"}
                })

                await rolXUsuarioXPrograma.destroy({
                    where:{ID_USUARIO: ID_TUTOR}            
                }, {transaction: transaccion})

                for(element of PROGRAMA){
                    const programaDeUsuario = await rolXUsuarioXPrograma.create({
                        ID_USUARIO: ID_TUTOR,
                        ID_PROGRAMA: element,
                        ESTADO: '1',
                        ID_ROL: idRol.ID_ROL
                    }, {transaction: transaccion})
                }

                await transaccion.commit();
                res.status(201).json({alumno: req.body.alumno}); 
            }else{
                await transaccion.rollback();
                if(validacionCodigo && validacionCorreo){
                    res.json({error: "Codigo y correo repetido", usuario: validacionCodigo})
                }else if(validacionCodigo){
                    res.json({error: "Codigo repetido", usuario: validacionCodigo})
                }else if(validacionCorreo){
                    res.json({error: "Correo repetido", usuario: validacionCorreo})
                }
            }   
        }); 
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};
     
controllers.listarEstadoSolicitudTutorFijo = async (req, res) => { // lista el tutor asignado a un alumno en cierto proceso de tutoria
    try{
        const tutores = await tutor.findAll({
            include: [{
                model: usuario,
                include: {
                    model: rolXUsuarioXPrograma, 
                    where: {
                        ESTADO: 1
                    },
                    include: {
                        model: rol,
                        where: {DESCRIPCION: "Tutor"},
                        attributes: []
                    },
                    attributes: []
                }
               },{
                   model: asignacionTutoria,
                   where: {
                       ID_TUTOR: Sequelize.col("TUTOR.ID_TUTOR"),
                       ID_PROCESO_TUTORIA: req.params.idTutoria
                   },
                   include: {
                       model: asignacionTutoriaXAlumno,
                       where: {
                           ID_ALUMNO: req.params.idAlumno,
                           ID_ASIGNACION: Sequelize.col("ASIGNACION_TUTORIA.ID_ASIGNACION")
                       },
                       attributes: ["SOLICITUD"]
                   },
                   //attributes: []
               }], 
        });
        let mensaje = "Sin tutor asignado";
        let tutorAsignado = null;
        let estado = 0
        if(tutores){
            for (element of tutores){
                for(element2 of element.ASIGNACION_TUTORIA){
                    for (element3 of element2.ASIGNACION_TUTORIA_X_ALUMNOs){
                        if(element3.SOLICITUD === 1){
                            // console.log("entree")
                            mensaje = "Ya tiene un tutor asignado en este proceso de tutoria";
                            tutorAsignado = element;
                            estado = 1
                            break;
                        }else if(element3.SOLICITUD === 2){
                            // console.log("entree")
                            mensaje = "Tiene una solicitud pendiente de respuesta";
                            tutorAsignado = element;
                            estado = 1
                            break;
                        }
                    }
                    if(tutorAsignado){
                        break;
                    }
                }
                if(tutorAsignado){
                    break;
                }
            }
        }
        res.status(201).json({estado: estado, mensaje: mensaje, tutor: tutorAsignado});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.citarAlumno = async (req, res) => { 
    const transaccion = await sequelize.transaction();
    const {EMISOR, RAZON, RECEPTOR} = req.body.cita; 
    // console.log("GOT: ", req.body.cita);//solo para asegurarme de que el objeto llego al backend
    
    try {
        const tut = await usuario.findOne({
            where: {ID_USUARIO: EMISOR}
        })

        const alum = await usuario.findOne({
            where: {ID_USUARIO: RECEPTOR}
        })

        const newNotif = await notificacion.create({
            ID_EMISOR: EMISOR,
            ID_RECEPTOR: RECEPTOR,
            ESTADO: 1,
            MENSAJE: RAZON
        }, { transaction: transaccion })

        await transaccion.commit();

        res.status(201).json({cita: newNotif});

        var correo = `Sr(a). ${alum.NOMBRE} ${alum.APELLIDOS}, ha recibido un mensaje del tutor ${tut.NOMBRE} ${tut.APELLIDOS}:
        
        ${RAZON}

        Contacto: ${tut.CORREO}   
        `

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ututor2020@gmail.com',
              pass: 'SeniorMito'
            }
          });
          
          var mailOptions = {
            from: `${tut.CORREO}`,
            to: `${alum.CORREO}`,
            subject: 'Mensaje Sistema uTutor',
            text: correo
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });      
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};


module.exports = controllers;