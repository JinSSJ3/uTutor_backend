const controllers = {}
const Sequelize = require('sequelize')
let sequelize = require('../models/database');
let programa = require('../models/programa');
let usuarioXPrograma = require('../models/usuarioXPrograma');
//let institucion = require('../models/institucion')

Op = Sequelize.Op;

controllers.listar = async (req, res) => { //listar todos los programas
    try {
        const programas = await programa.findAll(
            {
                //include: [institucion]
                include: {
                    model: programa,
                    as: 'FACULTAD'
                },
                where: {ID_FACULTAD: {[Op.ne]: null}}
            }
            
        );
        res.status(201).json({ programa: programas });
    } catch (error) {
        res.json({ error: error.message });
    }
};


controllers.listarProgramasYFacultades = async (req, res) => { 
    try {
        const programas = await programa.findAll(
            {
                //include: [institucion]
                include: {
                    model: programa,
                    as: 'FACULTAD'
                }
            }
        );
        res.status(201).json({ programa: programas });
    } catch (error) {
        res.json({ error: error.message });
    }
};

controllers.listarPorFacultad = async (req, res) => {// listar programas por facultad
    try {
        const programas = await programa.findAll(
            {
                //include: [institucion]
                include: {
                    model: programa,
                    as: 'FACULTAD',
                },
                where: {
                    ID_FACULTAD: req.params.id
                }
            }
        );
        res.status(201).json({ programa: programas });
    } catch (error) {
        res.json({ error: error.message });
    }
};

controllers.listarPorCoordinador = async (req, res) => { // lista facultades y programas por coordinador
    try {
        const programas = await usuarioXPrograma.findAll(
            {
                //include: [institucion]
                include: {
                    model: programa
                },
                where: {
                    ID_USUARIO: req.params.id
                }
            }
        );
        res.status(201).json({ programa: programas });
    } catch (error) {
        res.json({ error: error.message });
    }
};
controllers.listarFacultad = async (req, res) => {
    try {
        const facultades = await programa.findAll(
            {
                where: {ID_FACULTAD: null}
            }
        );
        res.status(201).json({ facultad: facultades });
    } catch (error) {
        res.json({ error: error.message });
    }
};



/**
 * @returns El nuevo programa (facultad) creado en formato Json()
 * HTTP status code 201 significa que se creo exitosamente
 */
controllers.registrarFacultad = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio una "facultad" en el cuerpo ("body") del request ("req")
     *  */ 
    const transaccion = await sequelize.transaction();
    const {ID_INSTITUCION, NOMBRE, IMAGEN} = req.body.facultad;
    console.log("GOT: ", req.body.facultad);//solo para asegurarme de que el objeto llego al backend
    
    try {
        const nuevaFacultad = await programa.create({
            ID_FACULTAD: null,
            ID_INSTITUCION: ID_INSTITUCION,
            NOMBRE: NOMBRE,
            IMAGEN: IMAGEN
        }, {transaction: transaccion});
            
        await transaccion.commit();
        res.status(201).json({facultad: nuevaFacultad});   
    }catch (error) {
        //console.log("err0");
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

/**
 * @returns El nuevo programa creado en formato Json()
 * HTTP status code 201 significa que se creo exitosamente
 */
controllers.registrarPrograma = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "programa" en el cuerpo ("body") del request ("req")
     *  */ 
    const transaccion = await sequelize.transaction();
    const {ID_FACULTAD, ID_INSTITUCION, NOMBRE, IMAGEN} = req.body.programa;
    console.log("GOT: ", req.body.programa);//solo para asegurarme de que el objeto llego al backend
    
    try {
        const nuevoPrograma = await programa.create({
            ID_FACULTAD: ID_FACULTAD,
            ID_INSTITUCION: ID_INSTITUCION,
            NOMBRE: NOMBRE,
            IMAGEN: IMAGEN
        }, {transaction: transaccion});
             
        await transaccion.commit();
        res.status(201).json({programa: nuevoPrograma});   
    }catch (error) {
        //console.log("err0");
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

controllers.modificarFacultad = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();
    const {ID_PROGRAMA,ID_INSTITUCION,NOMBRE, IMAGEN} = req.body.facultad; 
    console.log("GOT: ", req.body.facultad);//solo para asegurarme de que el objeto llego al backend
    try {
        const facultadModificada = await programa.update({
            ID_INSTITUCION: ID_INSTITUCION,
            NOMBRE: NOMBRE,
            IMAGEN: IMAGEN
        }, {
            where: {ID_PROGRAMA: ID_PROGRAMA}
        }, {transaction: transaccion});
           
        await transaccion.commit();
        res.status(201).json({facultad: facultadModificada});   
    }catch (error) {
        //console.log("err0");
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

controllers.modificarPrograma = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();
    const {ID_PROGRAMA, ID_FACULTAD, ID_INSTITUCION, NOMBRE, IMAGEN} = req.body.programa; 
    console.log("GOT: ", req.body.facultad);//solo para asegurarme de que el objeto llego al backend
    try {
        const programaModificado = await programa.update({
            ID_FACULTAD: ID_FACULTAD,
            ID_INSTITUCION: ID_INSTITUCION,
            NOMBRE: NOMBRE,
            IMAGEN: IMAGEN
        }, {
            where: {ID_PROGRAMA: ID_PROGRAMA}
        }, {transaction: transaccion});
           
        await transaccion.commit();
        res.status(201).json({programa: programaModificado});   
    }catch (error) {
        //console.log("err0");
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

module.exports = controllers;