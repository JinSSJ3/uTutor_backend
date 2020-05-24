const controllers = {}

let sequelize = require('../models/database');
let tutor = require('../models/tutor');
let disponibilidad = require('../models/disponibilidad');

sequelize.sync();

controllers.list = async (req, res) => { // lista disponibilidades de un tutor
    try{
        const {idtutor} = req.params;
        const data = await disponibilidad.findAll({
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


controllers.get = async (req, res) =>{ // devuelve una disponibilidad
    try{
        const {idtutor, id} = req.params;
        const data = await disponibilidad.findAll({
            where: {ID_TUTOR: idtutor,
                    ID_DISPONIBILIDAD: id},
            include: {
                model: tutor
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
    const {HORA_INICIO, HORA_FIN, FECHA, ID_TUTOR} = req.body.disponibilidad; 
    console.log("GOT: ", req.body.disponibilidad);//solo para asegurarme de que el objeto llego al backend
    
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
            ID_TUTOR: ID_TUTOR
        }, {transaction: transaccion});
        await transaccion.commit();
        res.status(201).json({newDisp: newDisp});
        
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
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
    const {ID_DISPONIBILIDAD, HORA_INICIO, HORA_FIN, FECHA, ID_TUTOR} = req.body.disponibilidad; 
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
            FECHA: FECHA
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