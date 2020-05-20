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
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "student" en el cuerpo ("body") del request ("req")
     *  */ 
    const transaccion = await sequelize.transaction();
    const {horaIni, horaFin, fecha, idTutor} = req.body.disponibilidad; 
    console.log("GOT: ", req.body.disponibilidad);//solo para asegurarme de que el objeto llego al backend
    
    try {
        const { Op } = require("sequelize");
        const valid = await disponibilidad.findAll({
            where:{
                [Op.or]: [
                    {ID_TUTOR: idTutor,
                        FECHA: fecha,
                        HORA_FIN: {
                            [Op.lte]: horaFin,
                            [Op.gte]: horaIni
                        }
                    },
                    {ID_TUTOR: idTutor,
                        FECHA: fecha,
                        HORA_INICIO: {
                            [Op.lte]: horaFin,
                            [Op.gte]: horaIni
                        }
                    }
                ]
              }
        })
        console.log(valid.length);
        if(valid.length != 0){
            let message = "La hora ya está ocupada";
            res.status(400).json({error: message});
            return;
        }
        const newDisp = await disponibilidad.create({
            HORA_INICIO: horaIni,
            HORA_FIN: horaFin,
            FECHA: fecha,
            ESTADO: 1,
            ID_TUTOR: idTutor
        }, {transaction: transaccion});
        await transaccion.commit();
        res.status(201).json({newDisp: newDisp});
        
    } catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};   
     
module.exports = controllers;