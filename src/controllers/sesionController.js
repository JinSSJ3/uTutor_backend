const controllers = {}

let sequelize = require('../models/database');
let tutor = require('../models/tutor');
let sesion = require('../models/sesion');
let alumnoXSesion = require('../models/alumnoXSesion');
let compromiso = require('../models/compromiso');
let areaApoyoXSesion = require('../models/areaApoyoXSesion');

sequelize.sync();


controllers.listar = async (req, res) => { // lista sesiones de un tutor
    try{
        const {idtutor} = req.params;
        const data = await sesion.findAll({
            where: {ID_TUTOR: idtutor},
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

            COMPROMISOS.forEach(async comp => {
                const newCompromiso = await compromiso.create({
                    ID_SESION: result.ID_SESION,
                    DESCRIPCION: comp,
                    ESTADO: 0
                }, {transaction: transaccion})
            })

            AREAS_APOYO.forEach(async area => {
                const newArea = await areaApoyoXSesion.create({
                    ID_SESION: result.ID_SESION,
                    ID_AREA_APOYO: area
                }, {transaction: transaccion})
            })

            ALUMNOS.forEach(async alumn => {
                const newAlumnoSesion = await alumnoXSesion.create({
                    ID_SESION: result.ID_SESION,
                    ID_ALUMNO: alumn
                }, {transaction: transaccion})
            })
        });
        await transaccion.commit();
        res.status(201).json({sesion: newSesion});
    } catch (error) {
            await transaccion.rollback();
            res.json({error: error.message})
    } 
};


//Esto registra en la base de datos una cita que solicita un alumno.
controllers.registrarCita = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    const {ID_TUTOR, ID_PROCESO_TUTORIA, LUGAR, MOTIVO, DESCRIPCION, FECHA, HORA_INICIO, HORA_FIN, ALUMNO} = req.body.sesion; 
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
        
        // Revisa que el alumno no tenga otra sesión a esa hora

        const findAlumSesiones = await alumnoXSesion.findAll({
            where:{
                ID_ALUMNO: ALUMNO,
            }
        }, {transaction: transaccion})
        if(findAlumSesiones.length != 0){
            for(let i=0; i< findAlumSesiones.length; i++){
                
                const valid3 = await sesion.findAll({
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
                if(valid3.length != 0){
                    let message = "Ya hay una cita pactada a esa hora";
                    res.status(400).json({message: message});
                    return;
                }
            }  
        };      
          
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

            const newAlumnoSesion = await alumnoXSesion.create({
                ID_SESION: result.ID_SESION,
                ID_ALUMNO: ALUMNO
            }, {transaction: transaccion})

        });
        await transaccion.commit();
        res.status(201).json({sesion: newSesion});
    } catch (error) {
            await transaccion.rollback();
            res.json({error: error.message})
    } 
};   

//Registrar los resultados de una sesión que se llevó a cabo exitosamente
controllers.registrarAsistencia = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    const {ID_SESION, RESULTADO, COMPROMISOS, AREAS_APOYO} = req.body.sesion; 
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {
        const miSesion = await sesion.findOne({
            where:{
                ID_SESION: ID_SESION,
            }
        }, {transaction: transaccion})
        miSesion.RESULTADO = RESULTADO;
        miSesion.ESTADO = "00-realizada_cita";
        await miSesion.save({transaction: transaccion});

        COMPROMISOS.forEach(async comp => {
            const newCompromiso = await compromiso.create({
                ID_SESION: ID_SESION,
                DESCRIPCION: comp,
                ESTADO: 0
            }, {transaction: transaccion})
        })

        AREAS_APOYO.forEach(async area => {
            const newArea = await areaApoyoXSesion.create({
                ID_SESION: ID_SESION,
                ID_AREA_APOYO: area
            }, {transaction: transaccion})
        })
        await transaccion.commit();
        res.status(201).json({sesion: miSesion});
    } catch (error) {
        console.log(error);
        await transaccion.rollback();
        res.json({error: error.message})
    }
}

//Registra que una sesión no se realizo por la inasistencia del alumno citado
controllers.registrarInasistencia = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    const {ID_SESION} = req.body.sesion; 
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {
        const miSesion = await sesion.findOne({
            where:{
                ID_SESION: ID_SESION,
            }
        }, {transaction: transaccion})
        miSesion.RESULTADO;
        miSesion.ESTADO = "05-no_asistencia";
        await miSesion.save({transaction: transaccion});

        await transaccion.commit();
        res.status(201).json({sesion: miSesion});
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
}

module.exports = controllers;