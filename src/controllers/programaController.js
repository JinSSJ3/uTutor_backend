const controllers = {}
const Sequelize = require('sequelize')
let sequelize = require('../models/database');
let programa = require('../models/programa');
let rolXUsuarioXPrograma = require('../models/rolXUsuarioXPrograma');
let rol = require('../models/rol');
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
                where: { ID_FACULTAD: { [Op.ne]: null } }
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

controllers.listarFacultadesDeUnCoordinador = async (req, res) => {
    try{
        const facultades = await programa.findAll({           
            include: [{
                model: rolXUsuarioXPrograma,
                where: {ID_USUARIO: req.params.idCoordinador, ESTADO: 1},
                include:[{
                    model: rol,
                    where: {DESCRIPCION: "Coordinador Facultad"},
                    attributes:[]
                }],
                attributes: []
            }],           
        });
        res.status(201).json({facultades:facultades});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
}

controllers.listarProgramasYFacultadesPorCoordinador = async (req, res) => { // lista facultades y programas por coordinador
    try {
        const programas = await rolXUsuarioXPrograma.findAll(
            {
                //include: [institucion]
                include: {
                    model: programa
                },
                where: {
                    ID_USUARIO: req.params.id,
                    ID_ROL: 2
                }
            }
        );
        res.status(201).json({ programa: programas });
    } catch (error) {
        res.json({ error: error.message });
    }
};

controllers.listarProgramasPorCoordinador = async (req, res) => { // lista solo programas por coordinador
    const idCoordinador = req.params.id
    console.log("GOT: ", idCoordinador)
    try {
        const programas = await rolXUsuarioXPrograma.findAll(
            {
                //include: [institucion]
                include: {
                    model: programa,
                    where: {
                        ID_FACULTAD: { [Op.ne]: null }
                    },
                    include: {
                        model: programa,
                        as: 'FACULTAD',
                    }
                },
                where: {
                    ID_USUARIO: idCoordinador,
                    ID_ROL: 2
                }
            }
        );
        res.status(201).json({ programa: programas });
    } catch (error) {
        res.json({ error: error.message });
    }
};

controllers.listarProgramasPorCoordinadorConFormato = async (req, res) => { // lista solo programas por coordinador
    const idCoordinador = req.params.id
    console.log("GOT: ", idCoordinador)
    try {
        const programas = await rolXUsuarioXPrograma.findAll(
            {
                //include: [institucion]
                attributes: [],
                include: {
                    model: programa,
                    where: {
                        ID_FACULTAD: { [Op.ne]: null }
                    },
                    include: {
                        model: programa,
                        as: 'FACULTAD',
                    }
                },
                where: {
                    ID_USUARIO: idCoordinador,
                    ID_ROL: 2
                }
            }
        );
        for (var i = 0; i < programas.length; i++) {
            programas[i] = programas[i].PROGRAMA;
        }
        res.status(201).json({ programa: programas });
    } catch (error) {
        res.json({ error: error.message });
    }
};

controllers.listarFacultad = async (req, res) => {
    try {
        const facultades = await programa.findAll(
            {
                where: {
                    [Op.or]: [
                        { ID_FACULTAD: null },
                        sequelize.where(sequelize.col('PROGRAMA.ID_FACULTAD'), '=', sequelize.col('PROGRAMA.ID_PROGRAMA'))
                    ]
                }
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
    const transaccion2 = await sequelize.transaction();
    const { ID_INSTITUCION, NOMBRE, IMAGEN, INDEPENDIENTE } = req.body.facultad;
    console.log("GOT: ", req.body.facultad);//solo para asegurarme de que el objeto llego al backend

    try {
        const facultades = await programa.findAll(
            {
                where: {
                    [Op.or]: [
                        { ID_FACULTAD: null },
                        sequelize.where(sequelize.col('PROGRAMA.ID_FACULTAD'), '=', sequelize.col('PROGRAMA.ID_PROGRAMA'))
                    ]
                }
            }
        );
        // Validar que el nombre no este duplicado
        for (var i = 0; i < facultades.length; i++) {
            if (facultades[i].NOMBRE.trim() === NOMBRE.trim()) {
                res.status(409).json({ registro: { ok: 0, facultad: null } });
                return
            };
        }

        const nuevaFacultad = await programa.create({
            ID_FACULTAD: null,
            ID_INSTITUCION: ID_INSTITUCION,
            NOMBRE: NOMBRE,
            IMAGEN: IMAGEN
        }, { transaction: transaccion });

        await transaccion.commit();

        if (INDEPENDIENTE) {
            const facultadModificada = await programa.update(
                { ID_FACULTAD: nuevaFacultad.ID_PROGRAMA },
                { where: { ID_PROGRAMA: nuevaFacultad.ID_PROGRAMA } },
                { transaction: transaccion2 }
            );

            await transaccion2.commit();
            nuevaFacultad.ID_FACULTAD = nuevaFacultad.ID_PROGRAMA;
            res.status(201).json({ registro: { ok: 1, facultad: nuevaFacultad } });
            return
        }

        res.status(201).json({ registro: { ok: 1, facultad: nuevaFacultad } });
    } catch (error) {
        //console.log("err0");
        await transaccion.rollback();
        await transaccion2.rollback();
        res.json({ error: error.message })
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
    const { ID_FACULTAD, ID_INSTITUCION, NOMBRE, IMAGEN } = req.body.programa;
    console.log("GOT: ", req.body.programa);//solo para asegurarme de que el objeto llego al backend

    try {
        const programasPorFacultad = await programa.findAll(
            {
                //include: [institucion]
                include: {
                    model: programa,
                    as: 'FACULTAD',
                },
                where: {
                    ID_FACULTAD: ID_FACULTAD
                }
            }
        );
        // Validar que el nombre no este duplicado
        for (var i = 0; i < programasPorFacultad.length; i++) {
            if (programasPorFacultad[i].NOMBRE.trim() === NOMBRE.trim()) {
                res.status(409).json({ registro: { ok: 0, programa: null } });
                return
            };
        }
        const nuevoPrograma = await programa.create({
            ID_FACULTAD: ID_FACULTAD,
            ID_INSTITUCION: ID_INSTITUCION,
            NOMBRE: NOMBRE,
            IMAGEN: IMAGEN
        }, { transaction: transaccion });

        await transaccion.commit();
        res.status(201).json({ registro: { ok: 1, programa: nuevoPrograma } });
    } catch (error) {
        //console.log("err0");
        await transaccion.rollback();
        res.json({ error: error.message })
    }

};

controllers.modificarFacultad = async (req, res) => {

    const transaccion = await sequelize.transaction();
    const { ID_PROGRAMA, ID_INSTITUCION, NOMBRE, IMAGEN } = req.body.facultad;
    console.log("GOT: ", req.body.facultad);//solo para asegurarme de que el objeto llego al backend
    try {
        const facultadModificada = await programa.update(
            {
                ID_INSTITUCION: ID_INSTITUCION,
                NOMBRE: NOMBRE,
                IMAGEN: IMAGEN
            },
            { where: { ID_PROGRAMA: ID_PROGRAMA } },
            { transaction: transaccion }
        );

        await transaccion.commit();
        res.status(201).json({ facultad: facultadModificada });
    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }

};

controllers.modificarPrograma = async (req, res) => {

    const transaccion = await sequelize.transaction();
    const { ID_PROGRAMA, ID_FACULTAD, ID_INSTITUCION, NOMBRE, IMAGEN } = req.body.programa;
    console.log("GOT: ", req.body.facultad);//solo para asegurarme de que el objeto llego al backend
    try {
        const programaModificado = await programa.update({
            ID_FACULTAD: ID_FACULTAD,
            ID_INSTITUCION: ID_INSTITUCION,
            NOMBRE: NOMBRE,
            IMAGEN: IMAGEN
        }, {
            where: { ID_PROGRAMA: ID_PROGRAMA }
        }, { transaction: transaccion });

        await transaccion.commit();
        res.status(201).json({ programa: programaModificado });
    } catch (error) {
        //console.log("err0");
        await transaccion.rollback();
        res.json({ error: error.message })
    }

};

module.exports = controllers;