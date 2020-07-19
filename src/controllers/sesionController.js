const controllers = {}

var nodemailer = require('nodemailer');

let sequelize = require('../models/database');
let tutor = require('../models/tutor');
let sesion = require('../models/sesion');
let alumnoXSesion = require('../models/alumnoXSesion');
let compromiso = require('../models/compromiso');
let areaApoyoXSesion = require('../models/areaApoyoXSesion');
let usuario = require('../models/usuario');
let alumno = require('../models/alumno');
let procesoTutoría = require('../models/procesoTutoria');
let notificacion = require('../models/notificacion');
let areaApoyo = require('../models/areaApoyo');
let procesoTutoria = require('../models/procesoTutoria');

//sequelize.sync();


controllers.listar = async (req, res) => { // lista sesiones de un tutor
    try {
        const { idtutor } = req.params;
        const data = await sesion.findAll({
            where: { ID_TUTOR: idtutor },
            include: [{
                model: alumno,
                include: [{
                    model: usuario,
                    attributes: ['NOMBRE', 'APELLIDOS']
                }]
            }, { model: compromiso },
            {model: procesoTutoría,}
        ],
            order: [["FECHA","ASC"], ["HORA_INICIO","ASC"]]
        });
        res.status(201).json({ data: data });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};

controllers.listarPorAlumno = async (req, res) => { // lista sesiones de un alumno
    try {
        const { idalumno } = req.params;
        const data = await sesion.findAll({
            include: [{
                model: alumno,
                where: { ID_ALUMNO: idalumno },
                required: true
            },
            {
                model: tutor,
                include: [{
                    model: usuario,
                    attributes: ['NOMBRE', 'APELLIDOS']
                }
                ]
            },
            {
                model: procesoTutoría,
            },
            {
                model: alumnoXSesion,
            }
            ],
            order: [
                ['FECHA', 'ASC']
            ]

        });
        res.status(201).json({ data: data });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};

controllers.listarPorAlumnoRealizadas = async (req, res) => { //listar sesiones realizadas por alumno
    try {
        const { idalumno } = req.params;
        const data = await sesion.findAll({
            where: {
                [Op.or]: [
                    { ESTADO: "01-realizada_sin_cita" },
                    { ESTADO: "00-realizada_cita" }
                ],
            },
            include: [{
                model: alumno,
                where: { ID_ALUMNO: idalumno },
                required: true
            },
            {
                model: procesoTutoría,
            }]
        });
        res.status(201).json({ data: data });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};

controllers.listarPorFecha = async (req, res) => { //listar sesiones por tutor por fecha
    try {
        const { idtutor, fecha } = req.params;
        const data = await sesion.findAll({
            where: {
                ID_TUTOR: idtutor,
                FECHA: fecha,
                ESTADO: {
                    [Op.not]: "02-cancelada"
                },
            },
            include: [{
                model: alumno,
                include: [{
                    model: usuario,
                    attributes: ['NOMBRE', 'APELLIDOS']
                }]
            }, { model: compromiso },
            {
                model: areaApoyoXSesion,
                include: [
                    areaApoyo
                ]
            },{
                model: procesoTutoria
            }
            ]
        });
        res.status(201).json({ data: data });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};

controllers.get = async (req, res) => { // devuelve una sesion
    try {
        const { idSesion } = req.params;
        const data = await sesion.findOne({
            where: { ID_SESION: idSesion },
        })
        res.status(201).json({ data: data });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};


// Esto registra una sesión realizada sin previa cita, lo hace el tutor.
controllers.registrarSesionInesperada = async (req, res) => {
    const transaccion = await sequelize.transaction();
    const { ID_TUTOR, ID_PROCESO_TUTORIA, LUGAR, MOTIVO, DESCRIPCION, FECHA, HORA_INICIO, HORA_FIN, RESULTADO, COMPROMISOS, AREAS_APOYO, ALUMNOS } = req.body.sesion;
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        if (FECHA > today) {
            let message = "La fecha seleccionada es inválida";
            res.status(400).json({ message: message });
            return;
        }

        const { Op } = require("sequelize");
        //Revisa que el tutor no tenga otra sesión a esa hora
        const valid = await sesion.findAll({
            where: {
                ID_TUTOR: ID_TUTOR,
                FECHA: FECHA,
                ESTADO: {
                    [Op.not]: "02-cancelada"
                },
                [Op.or]: [
                    {
                        HORA_FIN: {
                            [Op.gte]: HORA_FIN,
                        },
                        HORA_INICIO: {
                            [Op.lt]: HORA_FIN,
                        }
                    },
                    {
                        HORA_INICIO: {
                            [Op.lte]: HORA_INICIO,
                        },
                        HORA_FIN: {
                            [Op.gt]: HORA_INICIO,
                        }
                    },
                    {
                        HORA_INICIO: {
                            [Op.gte]: HORA_INICIO,
                        },
                        HORA_FIN: {
                            [Op.lte]: HORA_FIN,
                        }
                    }
                ]
            }
        })
        if (valid.length != 0) {
            let message = "La hora ya está ocupada";
            res.status(400).json({ message: message });
            return;
        }
        // Revisa que el alumno no tenga otra sesión a esa hora
        ALUMNOS.forEach(async alumId => {
            const findAlumSesiones = await alumnoXSesion.findAll({
                where: {
                    ID_ALUMNO: alumId,
                    ASISTENCIA_ALUMNO: {
                        [Op.not]: 2
                    }
                }
            }, { transaction: transaccion })
            if (findAlumSesiones.length != 0) {
                for (let i = 0; i < findAlumSesiones.length; i++) {
                    const valid2 = await sesion.findAll({
                        where: {
                            ID_SESION: findAlumSesiones[i].ID_SESION,
                            FECHA: FECHA,
                            [Op.or]: [
                                {
                                    HORA_FIN: {
                                        [Op.gte]: HORA_FIN,
                                    },
                                    HORA_INICIO: {
                                        [Op.lt]: HORA_FIN,
                                    }
                                },
                                {
                                    HORA_INICIO: {
                                        [Op.lte]: HORA_INICIO,
                                    },
                                    HORA_FIN: {
                                        [Op.gt]: HORA_INICIO,
                                    }
                                },
                                {
                                    HORA_INICIO: {
                                        [Op.gte]: HORA_INICIO,
                                    },
                                    HORA_FIN: {
                                        [Op.lte]: HORA_FIN,
                                    }
                                }
                            ]
                        }
                    })
                    if (valid2.length != 0) {
                        let message = "El alumno ya tiene una sesión a esa hora";
                        res.status(400).json({ message: message });
                        return;
                    }
                }
            }
        });


        const newSesion = await sesion.create({
            ID_TUTOR: ID_TUTOR,
            ID_PROCESO_TUTORIA: ID_PROCESO_TUTORIA,
            LUGAR: LUGAR,
            MOTIVO: MOTIVO,
            DESCRIPCION: DESCRIPCION,
            FECHA: FECHA,
            HORA_INICIO: HORA_INICIO,
            HORA_FIN: HORA_FIN,
            //RESULTADO: RESULTADO,
            ESTADO: "01-realizada_sin_cita"
        }, { transaction: transaccion }).then(async result => {

            for (element of COMPROMISOS) {
                const newCompromiso = await compromiso.create({
                    ID_SESION: result.ID_SESION,
                    DESCRIPCION: element.campo,
                    ESTADO: element.check,
                    ID_ALUMNO: ALUMNOS[0]
                }, { transaction: transaccion })
            }

            const alum = await usuario.findOne({
                where: {
                    ID_USUARIO: ALUMNOS[0]
                }
            })
    
            var mensaje = `Sr(a). ${alum.NOMBRE} ${alum.APELLIDOS}
            Se le adjunta la información de las unidades de apoyo que se le han sido asignadas:
            
            `

            for (element of AREAS_APOYO) {

                const areaMail = await areaApoyo.findOne({
                    where: {
                        ID_AREA_APOYO: element
                    }
                })
    
                mensaje += `
                          Unidad: ${areaMail.NOMBRE}
                          Contacto: ${areaMail.CONTACTO}
                          Correo: ${areaMail.CORREO}
                          
                          `

                const newArea = await areaApoyoXSesion.create({
                    ID_SESION: result.ID_SESION,
                    ID_AREA_APOYO: element,
                    ID_ALUMNO: ALUMNOS[0]
                }, { transaction: transaccion })
            }

            for (element of ALUMNOS) {
                const newAlumnoSesion = await alumnoXSesion.create({
                    ID_SESION: result.ID_SESION,
                    ID_ALUMNO: element,
                    ASISTENCIA_ALUMNO: 1,
                    RESULTADO: RESULTADO
                }, { transaction: transaccion })
            }
            await transaccion.commit();
            res.status(201).json({ sesion: result });

            mensaje+= `Atentamente, el equipo de uTutor.`

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ututor2020@gmail.com',
              pass: 'SeniorMito'
            }
          });
          
          var mailOptions = {
            from: 'ututor2020@gmail.com',
            to: `${alum.CORREO}`,
            subject: 'Asignación de áreas de apoyo',
            text: mensaje
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        });

    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }
};


//Esto registra en la base de datos una cita que solicita un alumno o una que programa el coordinador (individual o grupal)
controllers.registrarCita = async (req, res) => {
    const transaccion = await sequelize.transaction();
    const { ID_TUTOR, ID_PROCESO_TUTORIA, LUGAR, MOTIVO, DESCRIPCION, FECHA, HORA_INICIO, HORA_FIN, ALUMNOS } = req.body.sesion;
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        if (FECHA < today) {
            let message = "La fecha seleccionada es inválida";
            res.status(400).json({ message: message });
            return;
        }

        const { Op } = require("sequelize");

        //Revisa que el tutor no tenga otra sesión a esa hora
        const valid = await sesion.findAll({
            where: {
                ID_TUTOR: ID_TUTOR,
                FECHA: FECHA,
                ESTADO: {
                    [Op.not]: "02-cancelada"
                },
                [Op.or]: [
                    {
                        HORA_FIN: {
                            [Op.gte]: HORA_FIN,
                        },
                        HORA_INICIO: {
                            [Op.lt]: HORA_FIN,
                        }
                    },
                    {
                        HORA_INICIO: {
                            [Op.lte]: HORA_INICIO,
                        },
                        HORA_FIN: {
                            [Op.gt]: HORA_INICIO,
                        }
                    },
                    {
                        HORA_INICIO: {
                            [Op.gte]: HORA_INICIO,
                        },
                        HORA_FIN: {
                            [Op.lte]: HORA_FIN,
                        }
                    }
                ]
            }
        })
        if (valid.length != 0) {
            let message = "La hora ya está ocupada";
            res.status(400).json({ message: message });
            return;
        }

        // Revisa que el alumno no tenga otra sesión a esa hora
        ALUMNOS.forEach(async alumId => {
            const findAlumSesiones = await alumnoXSesion.findAll({
                where: {
                    ID_ALUMNO: alumId,
                    ASISTENCIA_ALUMNO: {
                        [Op.not]: 2
                    }
                }
            }, { transaction: transaccion })
            if (findAlumSesiones.length != 0) {
                for (let i = 0; i < findAlumSesiones.length; i++) {
                    const valid2 = await sesion.findAll({
                        where: {
                            ID_SESION: findAlumSesiones[i].ID_SESION,
                            FECHA: FECHA,
                            [Op.or]: [
                                {
                                    HORA_FIN: {
                                        [Op.gte]: HORA_FIN,
                                    },
                                    HORA_INICIO: {
                                        [Op.lt]: HORA_FIN,
                                    }
                                },
                                {
                                    HORA_INICIO: {
                                        [Op.lte]: HORA_INICIO,
                                    },
                                    HORA_FIN: {
                                        [Op.gt]: HORA_INICIO,
                                    }
                                },
                                {
                                    HORA_INICIO: {
                                        [Op.gte]: HORA_INICIO,
                                    },
                                    HORA_FIN: {
                                        [Op.lte]: HORA_FIN,
                                    }
                                }
                            ]
                        }
                    })
                    if (valid2.length != 0) {
                        let message = "El alumno ya tiene una sesión a esa hora";
                        res.status(400).json({ message: message });
                        return;
                    }
                }
            }
        });

        const newSesion = await sesion.create({
            ID_TUTOR: ID_TUTOR,
            ID_PROCESO_TUTORIA: ID_PROCESO_TUTORIA,
            LUGAR: LUGAR,
            MOTIVO: MOTIVO,
            DESCRIPCION: DESCRIPCION,
            FECHA: FECHA,
            HORA_INICIO: HORA_INICIO,
            HORA_FIN: HORA_FIN,
            ESTADO: "04-futura"
        }, { transaction: transaccion }).then(async result => {

            const newNotif = await notificacion.create({
                ID_SESION: result.ID_SESION,
                ID_EMISOR: ALUMNOS[0],
                ID_RECEPTOR: ID_TUTOR,
                ESTADO: 1,
                MENSAJE: "Tiene una nueva solicitud de cita de parte de un alumno"
            }, { transaction: transaccion })

            for (element of ALUMNOS) {
                const newAlumnoSesion = await alumnoXSesion.create({
                    ID_SESION: result.ID_SESION,
                    ID_ALUMNO: element
                }, { transaction: transaccion })
            }
            await transaccion.commit();
            res.status(201).json({ sesion: result });
        });

    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }
};

//Registrar los resultados y asistencia de una sesión que se llevó a cabo exitosamente
controllers.registrarResultados = async (req, res) => {
    const transaccion = await sequelize.transaction();
    const { ID_SESION, RESULTADO, COMPROMISOS, AREAS_APOYO, ALUMNOS, ASISTENCIA } = req.body.sesion;
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {
        const miSesion = await sesion.findOne({
            where: {
                ID_SESION: ID_SESION,
            }
        }, { transaction: transaccion })
        //miSesion.RESULTADO = RESULTADO;
        if (miSesion.ESTADO != "01-realizada_sin_cita") {
            miSesion.ESTADO = "00-realizada_cita";
        }
        await miSesion.save({ transaction: transaccion });

        COMPROMISOS.forEach(async comp => {

            const miCompromiso = await compromiso.findOne({
                where: {
                    ID_SESION: ID_SESION,
                    DESCRIPCION: comp.campo,
                    ID_ALUMNO: ALUMNOS[0]
                }
            }, { transaction: transaccion })
            console.log("AAAAAAAAAAAAAa" + miCompromiso);
            if ((miCompromiso == null) && (comp.campo != "")) {
                const newCompromiso = await compromiso.create({
                    ID_SESION: ID_SESION,
                    DESCRIPCION: comp.campo,
                    ESTADO: comp.check,
                    ID_ALUMNO: ALUMNOS[0]
                }, { transaction: transaccion })
            } else if (comp.campo != "") {
                miCompromiso.ESTADO = comp.check;
                await miCompromiso.save({ transaction: transaccion });
            }
        })

        const alum = await usuario.findOne({
            where: {
                ID_USUARIO: ALUMNOS[0]
            }
        })

        var mensaje = `Sr(a). ${alum.NOMBRE} ${alum.APELLIDOS}
        Se le adjunta la información de las unidades de apoyo que se le han sido asignadas:
        
        `

        AREAS_APOYO.forEach(async area => {

            const areaMail = await areaApoyo.findOne({
                where: {
                    ID_AREA_APOYO: area
                }
            })

            mensaje += `
                      Unidad: ${areaMail.NOMBRE}
                      Contacto: ${areaMail.CONTACTO}
                      Correo: ${areaMail.CORREO}
                      
                      `

            const newArea = await areaApoyoXSesion.create({
                ID_SESION: ID_SESION,
                ID_AREA_APOYO: area,
                ID_ALUMNO: ALUMNOS[0]
            }, { transaction: transaccion })
        })
        for (let i = 0; i < ALUMNOS.length; i++) {
            const asist = await alumnoXSesion.findOne({
                where: {
                    ID_SESION: ID_SESION,
                    ID_ALUMNO: ALUMNOS[i],
                }
            })
            asist.ASISTENCIA_ALUMNO = ASISTENCIA[i];
            asist.RESULTADO =  RESULTADO;
            await asist.save({ transaction: transaccion });
        }

        await transaccion.commit();
        res.status(201).json({ asist: req.body });

        mensaje+= `Atentamente, el equipo de uTutor.`

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ututor2020@gmail.com',
              pass: 'SeniorMito'
            }
          });
          
          var mailOptions = {
            from: 'ututor2020@gmail.com',
            to: `${alum.CORREO}`,
            subject: 'Asignación de áreas de apoyo',
            text: mensaje
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

    } catch (error) {
        console.log(error);
        await transaccion.rollback();
        res.json({ error: error.message })
    }
}

//Posponer cita
controllers.posponerCita = async (req, res) => {
    const transaccion = await sequelize.transaction();
    const { ID_SESION, ID_TUTOR, FECHA, HORA_INICIO, HORA_FIN, ALUMNOS, RAZON, EMISOR, RECEPTOR } = req.body.sesion;
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        if (FECHA < today) {
            let message = "La fecha seleccionada es inválida";
            res.status(400).json({ message: message });
            return;
        }

        const { Op } = require("sequelize");
        //Revisa que el tutor no tenga otra sesión a esa hora
        const valid = await sesion.findAll({
            where: {
                ID_TUTOR: ID_TUTOR,
                FECHA: FECHA,
                ID_SESION: {
                    [Op.not]: ID_SESION
                },
                ESTADO: {
                    [Op.not]: "02-cancelada"
                },
                [Op.or]: [
                    {
                        HORA_FIN: {
                            [Op.gte]: HORA_FIN,
                        },
                        HORA_INICIO: {
                            [Op.lt]: HORA_FIN,
                        }
                    },
                    {
                        HORA_INICIO: {
                            [Op.lte]: HORA_INICIO,
                        },
                        HORA_FIN: {
                            [Op.gt]: HORA_INICIO,
                        }
                    },
                    {
                        HORA_INICIO: {
                            [Op.gte]: HORA_INICIO,
                        },
                        HORA_FIN: {
                            [Op.lte]: HORA_FIN,
                        }
                    }
                ]
            }
        })
        if (valid.length != 0) {
            let message = "La hora ya está ocupada";
            res.status(400).json({ message: message });
            return;
        }
        // Revisa que el alumno no tenga otra sesión a esa hora
        ALUMNOS.forEach(async alumId => {
            const findAlumSesiones = await alumnoXSesion.findAll({
                where: {
                    ID_ALUMNO: alumId,
                    ASISTENCIA_ALUMNO: {
                        [Op.not]: 2
                    },
                    ID_SESION: {
                        [Op.not]: ID_SESION
                    },
                }
            }, { transaction: transaccion })
            if (findAlumSesiones.length != 0) {
                for (let i = 0; i < findAlumSesiones.length; i++) {
                    const valid2 = await sesion.findAll({
                        where: {
                            ID_SESION: findAlumSesiones[i].ID_SESION,
                            FECHA: FECHA,
                            [Op.or]: [
                                {
                                    HORA_FIN: {
                                        [Op.gte]: HORA_FIN,
                                    },
                                    HORA_INICIO: {
                                        [Op.lt]: HORA_FIN,
                                    }
                                },
                                {
                                    HORA_INICIO: {
                                        [Op.lte]: HORA_INICIO,
                                    },
                                    HORA_FIN: {
                                        [Op.gt]: HORA_INICIO,
                                    }
                                },
                                {
                                    HORA_INICIO: {
                                        [Op.gte]: HORA_INICIO,
                                    },
                                    HORA_FIN: {
                                        [Op.lte]: HORA_FIN,
                                    }
                                }
                            ]
                        }
                    })
                    if (valid2.length != 0) {
                        let message = "El alumno ya tiene una sesión a esa hora";
                        res.status(400).json({ message: message });
                        return;
                    }
                }
            }
        });

        const miSesion = await sesion.findOne({
            where: {
                ID_SESION: ID_SESION,
            }
        }, { transaction: transaccion })

        miSesion.FECHA = FECHA;
        miSesion.ESTADO = "03-pospuesta";
        miSesion.HORA_INICIO = HORA_INICIO;
        miSesion.HORA_FIN = HORA_FIN;
        miSesion.RAZON_MANTENIMIENTO = RAZON;
        await miSesion.save({ transaction: transaccion });

        for (element of RECEPTOR) {
            await notificacion.destroy({
                where: { ID_SESION: ID_SESION, ID_EMISOR: EMISOR, ID_RECEPTOR: element },
                transaction: transaccion
            })

            const newNotif = await notificacion.create({
                ID_SESION: ID_SESION,
                ID_EMISOR: EMISOR,
                ID_RECEPTOR: element,
                ESTADO: 1
            }, { transaction: transaccion })
        }

        await transaccion.commit();
        res.status(201).json({ sesion: miSesion });

    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }
}

//Cancelar cita
controllers.cancelarCita = async (req, res) => {
    const transaccion = await sequelize.transaction();
    const { ID_SESION, ALUMNOS, RAZON, EMISOR, RECEPTOR } = req.body.sesion;
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {
        const miSesion = await sesion.findOne({
            where: {
                ID_SESION: ID_SESION,
            }
        }, { transaction: transaccion })
        miSesion.ESTADO = "02-cancelada";
        miSesion.RAZON_MANTENIMIENTO = RAZON;
        await miSesion.save({ transaction: transaccion });

        for (let i = 0; i < ALUMNOS.length; i++) {
            const asist = await alumnoXSesion.findOne({
                where: {
                    ID_SESION: ID_SESION,
                    ID_ALUMNO: ALUMNOS[i]
                }
            })
            asist.ASISTENCIA_ALUMNO = 2;
            await asist.save({ transaction: transaccion });
        }

        for (element of RECEPTOR) {
            await notificacion.destroy({
                where: { ID_SESION: ID_SESION, ID_EMISOR: EMISOR, ID_RECEPTOR: element },
                transaction: transaccion
            })

            const newNotif = await notificacion.create({
                ID_SESION: ID_SESION,
                ID_EMISOR: EMISOR,
                ID_RECEPTOR: element,
                ESTADO: 1
            }, { transaction: transaccion })
        }

        await transaccion.commit();
        res.status(201).json({ sesion: miSesion });
    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }
}




//Listar compromisos
controllers.listarCompromisos = async (req, res) => {
    try {
        const { idsesion } = req.params;
        const data = await compromiso.findAll({
            where: { ID_SESION: idsesion },
        });
        res.status(201).json({ data: data });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};

controllers.listarSesionesPorAlumnoYProcesoTutoria = async (req, res) => {
    const idAlumno = req.params.idAlumno;
    const idProcesoTutoria = req.params.idProcesoTutoria;
    try {
        const data = await sesion.findAll({
            include: [
                {
                    model: compromiso
                },
                {
                    model: alumno,
                    where: { ID_ALUMNO: idAlumno },
                    attributes: []
                },
                {
                    model: procesoTutoría,
                    where: { ID_PROCESO_TUTORIA: idProcesoTutoria },
                    attributes: ["NOMBRE"]
                },
                {
                    model: tutor,
                    include: { model: usuario }
                },{
                    model: alumnoXSesion,
                    attributes:["ASISTENCIA_ALUMNO"]
                }
            ]
        });
        res.status(201).json({ sesiones: data });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};

//Listar compromisos por alumno
controllers.listarCompromisosPorAlumnoYProcesoTutoria = async (req, res) => {
    const idAlumno = req.params.idAlumno;
    const idProcesoTutoria = req.params.idProcesoTutoria;
    try {
        const data = await sesion.findAll({
            include: [
                {
                    model: compromiso
                },
                {
                    model: alumno,
                    where: { ID_ALUMNO: idAlumno },
                    attributes: []
                },
                {
                    model: procesoTutoría,
                    where: { ID_PROCESO_TUTORIA: idProcesoTutoria },
                    attributes: []
                }
            ]
        });

        var compromisos = [];
        for (var i = 0; i < data.length; i++) {
            console.log(data[i]);
            console.log("hola", data[i].COMPROMISOs);
            compromisos = compromisos.concat(data[i].COMPROMISOs);
        }

        res.status(201).json({ compromisos: compromisos });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};

//Listar areas de apoyo
controllers.listarAreasApoyo = async (req, res) => {
    try {
        const data = await areaApoyo.findAll();
        res.status(201).json({ data: data });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};

controllers.modificarCompromiso = async (req, res) => {

    const transaccion = await sequelize.transaction();
    const { ID_COMPROMISO, ID_SESION, DESCRIPCION, ESTADO } = req.body.compromiso;
    console.log("GOT: ", req.body.compromiso);//solo para asegurarme de que el objeto llego al backend
    try {

        const compormisoModificado = await compromiso.update(
            {
                ID_SESION: ID_SESION,
                DESCRIPCION: DESCRIPCION,
                ESTADO: ESTADO
            },
            { where: { ID_COMPROMISO: ID_COMPROMISO } },
            { transaction: transaccion }
        );

        await transaccion.commit();
        res.status(201).json({ modificacion: compormisoModificado });
    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }

};

controllers.listarMotivosSolicitud = async (req, res) => {  // motivos de solicitud por programa
    try{
        const { QueryTypes } = require('sequelize');
        const motivos = await sequelize.query("SELECT COUNT(*) CANTIDAD, MOTIVO FROM SESION, PROCESO_TUTORIA " +
        " WHERE SESION.ID_PROCESO_TUTORIA = PROCESO_TUTORIA.ID_PROCESO_TUTORIA AND PROCESO_TUTORIA.ID_PROGRAMA = " + req.params.idPrograma +
        " GROUP BY MOTIVO ", { type: QueryTypes.SELECT });
        
        res.status(201).json({motivosSolicitud:motivos});         
    }    
    catch (error) { 
        res.json({error: error.message});    
    }
};

controllers.listarTiempoTutoriasAcumulada = async (req, res) => {  // horas de tutoria brindadas por cada tutor
    try{
        const { QueryTypes } = require('sequelize');
        const motivos = await sequelize.query("SELECT SUM(TIME_TO_SEC(TIMEDIFF(TIME(HORA_FIN), TIME(HORA_INICIO)))/3600) TIEMPO, CONCAT(USUARIO.NOMBRE, ' ', USUARIO.APELLIDOS) NOMBRE " +
        " FROM SESION, ROL_X_USUARIO_X_PROGRAMA, PROGRAMA, USUARIO, PROCESO_TUTORIA " +
        " WHERE SESION.ID_TUTOR = ROL_X_USUARIO_X_PROGRAMA.ID_USUARIO AND ROL_X_USUARIO_X_PROGRAMA.ID_ROL = 3 " +
        " AND PROGRAMA.ID_PROGRAMA = ROL_X_USUARIO_X_PROGRAMA.ID_PROGRAMA  " +
        " AND SESION.ID_PROCESO_TUTORIA = PROCESO_TUTORIA.ID_PROCESO_TUTORIA " +
        " AND ROL_X_USUARIO_X_PROGRAMA.ID_PROGRAMA = PROCESO_TUTORIA.ID_PROGRAMA " +
        " AND PROGRAMA.ID_PROGRAMA = PROCESO_TUTORIA.ID_PROGRAMA " +
        " AND SESION.ID_TUTOR = USUARIO.ID_USUARIO " +
        " AND SESION.ESTADO LIKE '%realizada%' " +
        " AND ROL_X_USUARIO_X_PROGRAMA.ID_PROGRAMA = " + req.params.idPrograma +
        " GROUP BY SESION.ID_TUTOR ", { type: QueryTypes.SELECT });
        
        res.status(201).json({motivosSolicitud:motivos});         
    }    
    catch (error) { 
        res.json({error: error.message});    
    }
};

controllers.listarEstadoSesiones = async (req, res) => {  
    try{
        const { QueryTypes } = require('sequelize');
        const motivos = await sequelize.query("SELECT COUNT(*) CANTIDAD, TRIM(substring(SESION.ESTADO,4,9)) ESTADO" +
        " FROM SESION, PROCESO_TUTORIA" +
        " WHERE SESION.ID_PROCESO_TUTORIA = PROCESO_TUTORIA.ID_PROCESO_TUTORIA" +
        " AND (substring(SESION.ESTADO,4,9) = 'cancelada' OR substring(SESION.ESTADO,4,9) = 'realizada')" +
        " AND PROCESO_TUTORIA.ID_PROGRAMA = " + req.params.idPrograma +
        " GROUP BY substring(SESION.ESTADO,4,9) ", { type: QueryTypes.SELECT });
        
        res.status(201).json({motivosSolicitud:motivos});         
    }    
    catch (error) { 
        res.json({error: error.message});    
    }
};

controllers.listarSesionesRealizadasPorAlumnoYProcesoTutoria = async (req, res) => {
    const idAlumno = req.params.idAlumno;
    const idProcesoTutoria = req.params.idProcesoTutoria;
    try {
        const data = await sesion.findAll({
            include: [
                {
                    model: compromiso
                },
                {
                    model: alumno,
                    where: { ID_ALUMNO: idAlumno },
                    attributes: []
                },
                {
                    model: procesoTutoría,
                    where: { ID_PROCESO_TUTORIA: idProcesoTutoria },
                    attributes: ["NOMBRE"]
                },
                {
                    model: tutor,
                    include: { model: usuario }
                },{
                    model: alumnoXSesion,
                    attributes:["ASISTENCIA_ALUMNO"]
                }
            ],
            where: {
                [Op.or]: [
                    { ESTADO: "01-realizada_sin_cita" },
                    { ESTADO: "00-realizada_cita" }
                ],
             }
        });
        res.status(201).json({ sesiones: data });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};

// Esto crea una sesión grupal, lo hace el tutor.
controllers.crearSesionGrupal = async (req, res) => {
    const transaccion = await sequelize.transaction();
    const { ID_TUTOR, ID_PROCESO_TUTORIA, LUGAR, FECHA, HORA_INICIO, HORA_FIN, ALUMNOS } = req.body.sesion;
    try {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;


        const { Op } = require("sequelize");
        //Revisa que el tutor no tenga otra sesión a esa hora
        const valid = await sesion.findAll({
            where: {
                ID_TUTOR: ID_TUTOR,
                FECHA: FECHA,
                ESTADO: {
                    [Op.not]: "02-cancelada"
                },
                [Op.or]: [
                    {
                        HORA_FIN: {
                            [Op.gte]: HORA_FIN,
                        },
                        HORA_INICIO: {
                            [Op.lt]: HORA_FIN,
                        }
                    },
                    {
                        HORA_INICIO: {
                            [Op.lte]: HORA_INICIO,
                        },
                        HORA_FIN: {
                            [Op.gt]: HORA_INICIO,
                        }
                    },
                    {
                        HORA_INICIO: {
                            [Op.gte]: HORA_INICIO,
                        },
                        HORA_FIN: {
                            [Op.lte]: HORA_FIN,
                        }
                    }
                ]
            }
        })
        if (valid.length != 0) {
            let message = "La hora ya está ocupada";
            res.status(400).json({ message: message });
            return;
        }
        // Revisa que el alumno no tenga otra sesión a esa hora
        ALUMNOS.forEach(async alumId => {
            const findAlumSesiones = await alumnoXSesion.findAll({
                where: {
                    ID_ALUMNO: alumId,
                    ASISTENCIA_ALUMNO: {
                        [Op.not]: 2
                    }
                }
            }, { transaction: transaccion })
            if (findAlumSesiones.length != 0) {
                for (let i = 0; i < findAlumSesiones.length; i++) {
                    const valid2 = await sesion.findAll({
                        where: {
                            ID_SESION: findAlumSesiones[i].ID_SESION,
                            FECHA: FECHA,
                            [Op.or]: [
                                {
                                    HORA_FIN: {
                                        [Op.gte]: HORA_FIN,
                                    },
                                    HORA_INICIO: {
                                        [Op.lt]: HORA_FIN,
                                    }
                                },
                                {
                                    HORA_INICIO: {
                                        [Op.lte]: HORA_INICIO,
                                    },
                                    HORA_FIN: {
                                        [Op.gt]: HORA_INICIO,
                                    }
                                },
                                {
                                    HORA_INICIO: {
                                        [Op.gte]: HORA_INICIO,
                                    },
                                    HORA_FIN: {
                                        [Op.lte]: HORA_FIN,
                                    }
                                }
                            ]
                        }
                    })
                    if (valid2.length != 0) {
                        let message = "El alumno ya tiene una sesión a esa hora";
                        res.status(400).json({ message: message });
                        return;
                    }
                }
            }
        });

        const newSesion = await sesion.create({
            ID_TUTOR: ID_TUTOR,
            ID_PROCESO_TUTORIA: ID_PROCESO_TUTORIA,
            LUGAR: LUGAR,
            FECHA: FECHA,
            HORA_INICIO: HORA_INICIO,
            HORA_FIN: HORA_FIN,
            ESTADO: "04-futura"
        }, { transaction: transaccion }).then(async result => {
            for (element of ALUMNOS) {
                const newAlumnoSesion = await alumnoXSesion.create({
                    ID_SESION: result.ID_SESION,
                    ID_ALUMNO: element
                }, { transaction: transaccion })
            }
            await transaccion.commit();
            res.status(201).json({ sesion: result });
        });
    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }
};

module.exports = controllers;