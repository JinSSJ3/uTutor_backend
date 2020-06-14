const controllers = {}
const moment = require('moment');

let sequelize = require('../models/database');
let tutor = require('../models/tutor');
let disponibilidad = require('../models/disponibilidad');
let usuario = require('../models/usuario');
let rolXUsuarioXPrograma = require("../models/rolXUsuarioXPrograma");

//sequelize.sync();

controllers.listarPorTutor = async (req, res) => { // lista disponibilidades de un tutor
    try{
        const {idtutor} = req.params;
        const data = await disponibilidad.findAll({
            where: {ID_TUTOR: idtutor,
                    ESTADO: 1},
            include: {
                model: tutor,
                include: {
                    model: usuario,
                    attributes: ['NOMBRE', 'APELLIDOS']
                }
               } 
        });
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listar = async (req, res) => { // lista disponibilidades
    try{
        const data = await disponibilidad.findAll({
            where: {ESTADO: 1},
            include: {
                model: tutor,
                include: {
                    model: usuario,
                    attributes: ['NOMBRE', 'APELLIDOS']
                }
               } 
        });
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarPorFecha = async (req, res) => { //listar disponibilidades por fecha
    try{
        const {fecha} = req.params;
        const data = await disponibilidad.findAll({
            where: {FECHA: fecha,
                    ESTADO: 1},
            include: {
                model: tutor,
                include: {
                    model: usuario,
                    attributes: ['NOMBRE', 'APELLIDOS']
                }
               } 
        });
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarPorProgramaFecha = async (req, res) => { //listar disponibilidades por programa y fecha
    try{
        const {idprograma, fecha} = req.params;
        const data = await disponibilidad.findAll({
            where: {FECHA: fecha,
                    ESTADO: 1},
            include: {
                model: tutor,
                include: {
                    model: usuario,
                    attributes: ['NOMBRE', 'APELLIDOS'],
                    include: {
                        model: rolXUsuarioXPrograma,
                        where: {ID_PROGRAMA:idprograma} 
                    }
                }
               } 
        });
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};


controllers.listarPorTutorFecha = async (req, res) => { //listar disponibilidades por fecha por tutor
    try{
        const {fecha, idtutor} = req.params;
        const data = await disponibilidad.findAll({
            where: {ID_TUTOR: idtutor,
                    FECHA: fecha,
                    ESTADO: 1},
            include: {
                model: tutor,
                include: {
                    model: usuario,
                    attributes: ['NOMBRE', 'APELLIDOS']
                }
               } 
        });
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};

controllers.listarPorProgramaTutorFecha = async (req, res) => { //listar disponibilidades por fecha por tutor
    try{
        const {idprograma, fecha, idtutor} = req.params;
        const data = await disponibilidad.findAll({
            where: {ID_TUTOR: idtutor,
                    FECHA: fecha,
                    ESTADO: 1},
            include: {
                model: tutor,
                include: {
                    model: usuario,
                    attributes: ['NOMBRE', 'APELLIDOS'],
                    include: {
                        model: rolXUsuarioXPrograma,
                        where: {ID_PROGRAMA:idprograma} 
                    }
                }
               } 
        });
        res.status(201).json({data:data});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};


controllers.get = async (req, res) =>{ // devuelve una disponibilidad
    try{
        const {idtutor, id} = req.params;
        const data = await disponibilidad.findAll({
            where: {ID_TUTOR: idtutor,
                    ID_DISPONIBILIDAD: id},
            include: {
                model: tutor,
                include: {
                    model: usuario,
                    attributes: ['NOMBRE', 'APELLIDOS']
                }
               }
        })
        res.status(201).json({data:data});        
    }
    catch(error){
        res.json({error: error.message});
    }

}

controllers.register = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    const {HORA_INICIO, HORA_FIN, FECHA, ID_TUTOR, LUGAR, REPETICION} = req.body.disponibilidad; 
    console.log("GOT: ", req.body.disponibilidad);//solo para asegurarme de que el objeto llego al backend
    if (REPETICION == 1){
         try {
            const { Op } = require("sequelize");
            const valid = await disponibilidad.findAll({
                where:{
                    ID_TUTOR: ID_TUTOR,
                    FECHA: FECHA,
                    ESTADO: 1,
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
                res.status(400).json({error: message});
                return;
            }
            const newDisp = await disponibilidad.create({
                HORA_INICIO: HORA_INICIO,
                HORA_FIN: HORA_FIN,
                FECHA: FECHA,
                ESTADO: 1,
                LUGAR: LUGAR,
                ID_TUTOR: ID_TUTOR
            }, {transaction: transaccion});
            await transaccion.commit();
            res.status(201).json({newDisp: newDisp});
            
        } catch (error) {
            await transaccion.rollback();
            res.json({error: error.message})
        }
    }else if(REPETICION==2){
        let fec = moment(FECHA, "YYYY-MM-DD", true);
        fec.format();
        let mes = fec.month();
        let dia = fec.day();
        console.log(mes);
        console.log(fec);
        console.log(dia);
        let dias = [];
        while (fec.month() === mes) {
            let nuevaFecha = moment(fec);
            dias.push(moment(nuevaFecha).format('YYYY-MM-DD'));
            fec = moment(fec).add(7, 'days');
            console.log(fec);
        }
        console.log(dias)
        try {
            const { Op } = require("sequelize");
            dias.forEach(async fechaRep => {
                const valid = await disponibilidad.findAll({
                    where:{
                        ID_TUTOR: ID_TUTOR,
                        FECHA: fechaRep,
                        ESTADO: 1,
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
                    let message = "Una de las horas ya está ocupada";
                    res.status(400).json({message: message});
                    return;
                }
                const newDisp = await disponibilidad.create({
                    HORA_INICIO: HORA_INICIO,
                    HORA_FIN: HORA_FIN,
                    FECHA: fechaRep,
                    ESTADO: 1,
                    LUGAR: LUGAR,
                    ID_TUTOR: ID_TUTOR
                }, {transaction: transaccion});
                await transaccion.commit();
            })
            res.status(201).json({dias: dias});
        } catch (error) {
            await transaccion.rollback();
            res.json({error: error.message})
        }
    }
    
};

controllers.eliminar = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();   
    try {
        const dispEliminada = await disponibilidad.update({
            ESTADO: 0
        }, {
            where: {ID_DISPONIBILIDAD: req.params.idDisp}
        }, {transaction: transaccion})       
        await transaccion.commit();
        res.status(201).json({resultado: "Disponibilidad eliminada"}); 
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }  
};


controllers.modificar = async (req, res) => {  
    const transaccion = await sequelize.transaction();
    const {ID_DISPONIBILIDAD, HORA_INICIO, HORA_FIN, FECHA, ID_TUTOR, LUGAR} = req.body.disponibilidad; 
    console.log("GOT: ", req.body.disponibilidad);//solo para asegurarme de que el objeto llego al backend
    
    try {
        const { Op } = require("sequelize");
        const valid = await disponibilidad.findAll({
            where:{
                ID_DISPONIBILIDAD:{[Op.not]: ID_DISPONIBILIDAD},
                ID_TUTOR: ID_TUTOR,
                FECHA: FECHA,
                ESTADO: 1,
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
            res.status(400).json({error: message});
            return;
        }

        const dispModif = await disponibilidad.update({
            ID_TUTOR: ID_TUTOR,
            HORA_INICIO: HORA_INICIO,
            HORA_FIN: HORA_FIN,
            FECHA: FECHA,
            LUGAR: LUGAR
        }, {
            where: {ID_DISPONIBILIDAD: ID_DISPONIBILIDAD}
        }, {transaction: transaccion})
        await transaccion.commit();
        res.status(201).json({dispModif: dispModif});
        
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};
     
module.exports = controllers;