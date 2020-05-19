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

    const {horaIni, horaFin, fecha, idTutor} = req.body.disponibilidad; 
    console.log("GOT: ", req.body.disponibilidad);//solo para asegurarme de que el objeto llego al backend
    try {
        const newDisp = await disponibilidad.create({
            HORA_INICIO: horaIni,
            HORA_FIN: horaFin,
            FECHA: fecha,
            ESTADO: 1,
            ID_TUTOR: idTutor
        });
        res.status(201).json({newDisp: newDisp});
        
    } catch (error) {
        res.json({error: error.message})
    }
    
};   
     
module.exports = controllers;