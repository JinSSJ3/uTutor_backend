const controllers = {}

let sequelize = require('../models/database');
let tutor = require('../models/tutor');
let sesion = require('../models/sesion');
let alumnoXSesion = require('../models/alumnoXSesion');
let compromiso = require('../models/compromiso');
let areaApoyoXSesion = require('../models/areaApoyoXSesion');

sequelize.sync();


controllers.list = async (req, res) => { // lista sesiones de un tutor
    try{
        const {idtutor} = req.params;
        const data = await sesion.findAll({
            where: {ID_TUTOR: idtutor},
            include: {
                model: tutor,
               } 
        });
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.get = async (req, res) =>{ // devuelve una sesion
    try{
        const {id} = req.params;
        const data = await sesion.findOne({
            where: {ID_SESION: id},
        })
        res.status(201).json({data:data});        
    }
    catch(error){
        res.json({error: error.message});
    }
};


controllers.registerUnexpectedSession = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "student" en el cuerpo ("body") del request ("req")
     *  */ 
    const transaccion = await sequelize.transaction();
    const {ID_TUTOR, ID_PROCESO_TUTORIA, LUGAR, MOTIVO, DESCRIPCION, FECHA, HORA_INICIO, HORA_FIN, RESULTADO, COMPROMISOS, AREAS_APOYO, ALUMNOS} = req.body.sesion; 
    console.log("GOT: ", req.body.sesion);//solo para asegurarme de que el objeto llego al backend
    try {
        const { Op } = require("sequelize");
        //Revisa que el tutor no tenga otra sesión a esa hora
        const valid = await sesion.findAll({
            where:{
                ID_TUTOR: ID_TUTOR,
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
        if(valid.length != 0){
            let message = "La hora ya está ocupada";
            res.status(400).json({message: message});
            return;
        }
        // Revisa que el alumno no tenga otra sesión a esa hora
        ALUMNOS.forEach(async alumId => {
            console.log("REEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
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
                        let message = "La hora ya está ocupada";
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
            ESTADO: "Inesperada"
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
        res.status(201).json({newSesion: newSesion});
    } catch (error) {
            await transaccion.rollback();
            res.json({error: error.message})
    } 
};   
     

module.exports = controllers;