const controllers = {}

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

//sequelize.sync();


controllers.listar = async (req, res) => { // lista sesiones de un tutor
    try{
        const {idtutor} = req.params;
        const data = await sesion.findAll({
            where: {ID_TUTOR: idtutor},
            include: [{
                model: alumno,
                include: [{
                    model: usuario,
                    attributes: ['NOMBRE', 'APELLIDOS']
                }]
            },{model: compromiso}]
        });
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarPorAlumno = async (req, res) => { // lista sesiones de un alumno
    try{
        const {idalumno} = req.params;
        const data = await sesion.findAll({
            include: [{
                model: alumno,
                where: {ID_ALUMNO: idalumno},
                required: true
            },
            {model: tutor,
                include: [{
                    model: usuario,
                    attributes: ['NOMBRE', 'APELLIDOS']}
                ]},
            {model: procesoTutoría,           
            }
        ],
        order: [
            ['FECHA', 'DESC']
        ]
            
        });
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarPorAlumnoRealizadas = async (req, res) => { //listar sesiones realizadas por alumno
    try{
        const {idalumno} = req.params;
        const data = await sesion.findAll({
            where: {
                    [Op.or]: [
                        {ESTADO: "01-realizada_sin_cita"},
                        {ESTADO: "00-realizada_cita"}
                    ],
                },
                include: [{
                    model: alumno,
                    where: {ID_ALUMNO: idalumno},
                    required: true
                },
                {model: procesoTutoría,           
                }]
        });
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarPorFecha = async (req, res) => { //listar sesiones por tutor por fecha
    try{
        const {idtutor, fecha} = req.params;
        const data = await sesion.findAll({
            where: {ID_TUTOR: idtutor,
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
                    },{model: compromiso}] 
        });
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.get = async (req, res) =>{ // devuelve una sesion
    try{
        const {idSesion} = req.params;
        const data = await sesion.findOne({
            where: {ID_SESION: idSesion},
        })
        res.status(201).json({data:data});        
    }
    catch(error){
        res.json({error: error.message});
    }
};


// Esto registra una sesión realizada sin previa cita, lo hace el tutor.
controllers.registrarSesionInesperada = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    const {ID_TUTOR, ID_PROCESO_TUTORIA, LUGAR, MOTIVO, DESCRIPCION, FECHA, HORA_INICIO, HORA_FIN, RESULTADO, COMPROMISOS, AREAS_APOYO, ALUMNOS} = req.body.sesion; 
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        if (FECHA > today){
            let message = "La fecha seleccionada es inválida";
            res.status(400).json({message: message});
            return;
        }

        const { Op } = require("sequelize");
        //Revisa que el tutor no tenga otra sesión a esa hora
        const valid = await sesion.findAll({
            where:{
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
        if(valid.length != 0){
            let message = "La hora ya está ocupada";
            res.status(400).json({message: message});
            return;
        }
        // Revisa que el alumno no tenga otra sesión a esa hora
        ALUMNOS.forEach(async alumId => {
            const findAlumSesiones = await alumnoXSesion.findAll({
                where:{
                    ID_ALUMNO: alumId,
                    ASISTENCIA_ALUMNO: {
                        [Op.not]: 2
                    }
                }
            }, {transaction: transaccion})
            if(findAlumSesiones.length != 0){
                for(let i=0; i< findAlumSesiones.length; i++){
                    const valid2 = await sesion.findAll({
                        where:{
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
                    if(valid2.length != 0){
                        let message = "El alumno ya tiene una sesión a esa hora";
                        res.status(400).json({message: message});
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
            RESULTADO: RESULTADO,
            ESTADO: "01-realizada_sin_cita"
        }, {transaction: transaccion}).then(async result  => {

            for(element of COMPROMISOS){
                const newCompromiso = await compromiso.create({
                    ID_SESION: result.ID_SESION,
                    DESCRIPCION: element.campo,
                    ESTADO: element.check
                }, {transaction: transaccion})
            }

            for(element of AREAS_APOYO){
                const newArea = await areaApoyoXSesion.create({
                    ID_SESION: result.ID_SESION,
                    ID_AREA_APOYO: element
                }, {transaction: transaccion})
            }

            for(element of ALUMNOS){
                const newAlumnoSesion = await alumnoXSesion.create({
                    ID_SESION: result.ID_SESION,
                    ID_ALUMNO: element,
                    ASISTENCIA_ALUMNO: 1
                }, {transaction: transaccion})
            }
            await transaccion.commit();
            res.status(201).json({sesion: result});
        });
        
    } catch (error) {
            await transaccion.rollback();
            res.json({error: error.message})
    } 
};


//Esto registra en la base de datos una cita que solicita un alumno o una que programa el coordinador (individual o grupal)
controllers.registrarCita = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    const {ID_TUTOR, ID_PROCESO_TUTORIA, LUGAR, MOTIVO, DESCRIPCION, FECHA, HORA_INICIO, HORA_FIN, ALUMNOS} = req.body.sesion; 
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        if (FECHA < today){
            let message = "La fecha seleccionada es inválida";
            res.status(400).json({message: message});
            return;
        }

        const { Op } = require("sequelize");

        //Revisa que el tutor no tenga otra sesión a esa hora
        const valid = await sesion.findAll({
            where:{
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
        if(valid.length != 0){
            let message = "La hora ya está ocupada";
            res.status(400).json({message: message});
            return;
        }
        
        // Revisa que el alumno no tenga otra sesión a esa hora
        ALUMNOS.forEach(async alumId => {
            const findAlumSesiones = await alumnoXSesion.findAll({
                where:{
                    ID_ALUMNO: alumId,
                    ASISTENCIA_ALUMNO: {
                        [Op.not]: 2
                    }
                }
            }, {transaction: transaccion})
            if(findAlumSesiones.length != 0){
                for(let i=0; i< findAlumSesiones.length; i++){
                    const valid2 = await sesion.findAll({
                        where:{
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
                    if(valid2.length != 0){
                        let message = "El alumno ya tiene una sesión a esa hora";
                        res.status(400).json({message: message});
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
        }, {transaction: transaccion}).then(async result  => {

            for(element of ALUMNOS){
                const newAlumnoSesion = await alumnoXSesion.create({
                    ID_SESION: result.ID_SESION,
                    ID_ALUMNO: element
                }, {transaction: transaccion})
            }
            await transaccion.commit();
            res.status(201).json({sesion: result});
        });

    } catch (error) {
            await transaccion.rollback();
            res.json({error: error.message})
    } 
};   

//Registrar los resultados y asistencia de una sesión que se llevó a cabo exitosamente
controllers.registrarResultados = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    const {ID_SESION, RESULTADO, COMPROMISOS, AREAS_APOYO, ALUMNOS, ASISTENCIA} = req.body.sesion; 
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {
        const miSesion = await sesion.findOne({
            where:{
                ID_SESION: ID_SESION,
            }
        }, {transaction: transaccion})
        miSesion.RESULTADO = RESULTADO;
        if (miSesion.ESTADO != "01-realizada_sin_cita"){
            miSesion.ESTADO = "00-realizada_cita";
        }    
        await miSesion.save({transaction: transaccion});

        COMPROMISOS.forEach(async comp => {

            const miCompromiso = await compromiso.findOne({
                where:{
                    ID_SESION: ID_SESION,
                    DESCRIPCION: comp.campo
                }
            }, {transaction: transaccion})
            console.log("AAAAAAAAAAAAAa"+miCompromiso);
            if((miCompromiso == null) && (comp.campo != "")){
                const newCompromiso = await compromiso.create({
                    ID_SESION: ID_SESION,
                    DESCRIPCION: comp.campo,
                    ESTADO: comp.check
                }, {transaction: transaccion})
            }else if(comp.campo!=""){
                miCompromiso.ESTADO = comp.check;
                await miCompromiso.save({transaction: transaccion});
            }  
        })

        AREAS_APOYO.forEach(async area => {
            const newArea = await areaApoyoXSesion.create({
                ID_SESION: ID_SESION,
                ID_AREA_APOYO: area
            }, {transaction: transaccion})
        })
        for(let i=0; i<ALUMNOS.length;i++){
            const asist = await alumnoXSesion.findOne({
                where:{
                    ID_SESION: ID_SESION,
                    ID_ALUMNO: ALUMNOS[i]
                }
            })
            asist.ASISTENCIA_ALUMNO = ASISTENCIA[i];
            await asist.save({transaction: transaccion});
        }

        await transaccion.commit();
        res.status(201).json({miSesion: miSesion});
    } catch (error) {
        console.log(error);
        await transaccion.rollback();
        res.json({error: error.message})
    }
}

//Posponer cita
controllers.posponerCita = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    const {ID_SESION, ID_TUTOR, FECHA, HORA_INICIO, HORA_FIN, ALUMNOS, RAZON, EMISOR, RECEPTOR} = req.body.sesion; 
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        if (FECHA < today){
            let message = "La fecha seleccionada es inválida";
            res.status(400).json({message: message});
            return;
        }

        const { Op } = require("sequelize");
        //Revisa que el tutor no tenga otra sesión a esa hora
        const valid = await sesion.findAll({
            where:{
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
        if(valid.length != 0){
            let message = "La hora ya está ocupada";
            res.status(400).json({message: message});
            return;
        }
        // Revisa que el alumno no tenga otra sesión a esa hora
        ALUMNOS.forEach(async alumId => {
            const findAlumSesiones = await alumnoXSesion.findAll({
                where:{
                    ID_ALUMNO: alumId,
                    ASISTENCIA_ALUMNO: {
                        [Op.not]: 2
                    },
                    ID_SESION: {
                        [Op.not]: ID_SESION
                    },
                }
            }, {transaction: transaccion})
            if(findAlumSesiones.length != 0){
                for(let i=0; i< findAlumSesiones.length; i++){
                    const valid2 = await sesion.findAll({
                        where:{
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
                    if(valid2.length != 0){
                        let message = "El alumno ya tiene una sesión a esa hora";
                        res.status(400).json({message: message});
                        return;
                    }
                }  
            }       
        });

        const miSesion = await sesion.findOne({
            where:{
                ID_SESION: ID_SESION,
            }
        }, {transaction: transaccion})

        miSesion.FECHA = FECHA;
        miSesion.ESTADO = "03-pospuesta";
        miSesion.HORA_INICIO = HORA_INICIO;
        miSesion.HORA_FIN = HORA_FIN;
        miSesion.RAZON_MANTENIMIENTO = RAZON;
        await miSesion.save({transaction: transaccion});

        for(element of RECEPTOR){
            const newNotif = await notificacion.create({
                ID_SESION: ID_SESION,
                ID_EMISOR: EMISOR,
                ID_RECEPTOR: element,
                ESTADO: 1
            }, {transaction: transaccion})
        }

        await transaccion.commit();
        res.status(201).json({sesion: miSesion});

    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
}

//Cancelar cita
controllers.cancelarCita = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    const {ID_SESION, ALUMNOS, RAZON, EMISOR, RECEPTOR} = req.body.sesion; 
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {
        const miSesion = await sesion.findOne({
            where:{
                ID_SESION: ID_SESION,
            }
        }, {transaction: transaccion})
        miSesion.ESTADO = "02-cancelada";
        miSesion.RAZON_MANTENIMIENTO = RAZON;
        await miSesion.save({transaction: transaccion});

        for(let i=0; i<ALUMNOS.length;i++){
            const asist = await alumnoXSesion.findOne({
                where:{
                    ID_SESION: ID_SESION,
                    ID_ALUMNO: ALUMNOS[i]
                }
            })
            asist.ASISTENCIA_ALUMNO = 2;
            await asist.save({transaction: transaccion});
        }

        for(element of RECEPTOR){
            const newNotif = await notificacion.create({
                ID_SESION: ID_SESION,
                ID_EMISOR: EMISOR,
                ID_RECEPTOR: element,
                ESTADO: 1
            }, {transaction: transaccion})
        }

        await transaccion.commit();
        res.status(201).json({sesion: miSesion});
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
}

module.exports = controllers;


//Listar compromisos
controllers.listarCompromisos = async (req, res) => {
    try{
        const {idsesion} = req.params;
        const data = await compromiso.findAll({
            where: {ID_SESION: idsesion},
        });
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

//Listar areas de apoyo
controllers.listarAreasApoyo = async (req, res) => {
    try{
        const data = await areaApoyo.findAll();
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};