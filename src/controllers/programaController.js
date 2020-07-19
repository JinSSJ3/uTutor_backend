const controllers = {}
const Sequelize = require('sequelize')
let sequelize = require('../models/database');
let programa = require('../models/programa');
let coordinador = require('../models/usuario');
let rolXUsuarioXPrograma = require('../models/rolXUsuarioXPrograma');
let rol = require('../models/rol');
let tutoria = require('../models/procesoTutoria');
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
                where: {
                    ID_FACULTAD: { [Op.ne]: null },
                    ESTADO: 1
                }
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
                },
                where: { ESTADO: 1 }
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
                include: [
                    {
                        model: programa,
                        as: 'FACULTAD',
                    },
                    {
                        model: rolXUsuarioXPrograma,
                        include: [
                            {
                                model: rol,
                                where: { DESCRIPCION: "Coordinador Programa" },
                                attributes: [],
                            }, {
                                model: coordinador,
                                attributes: ["ID_USUARIO", "NOMBRE", "APELLIDOS"]
                            }
                        ],
                        where: { ESTADO: 1 },
                        required: false
                    }],
                where: {
                    ID_FACULTAD: req.params.id,
                    ESTADO: 1
                },
                required: true
            }
        );
        res.status(201).json({ programa: programas });
    } catch (error) {
        res.json({ error: error.message });
    }
};

controllers.listarFacultadesDeUnCoordinador = async (req, res) => {
    try {      // lista las facultades de un coordinador de facultad 
        const facultades = await programa.findAll({
            include: [{
                model: rolXUsuarioXPrograma,
                where: { ID_USUARIO: req.params.idCoordinador, ESTADO: 1 },
                include: [{
                    model: rol,
                    where: { DESCRIPCION: "Coordinador Facultad" },
                    attributes: []
                }],
                attributes: []
            }],
            where: { ESTADO: 1 }
        });
        res.status(201).json({ facultades: facultades });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

controllers.listarFacultadesDeUnCoordinadorPrograma = async (req, res) => {
    try {        // lista las facultades de un coordinador de programa
        const facultades = await programa.findAll({
            include: [{
                model: rolXUsuarioXPrograma,
                where: { ID_USUARIO: req.params.idCoordinador, ESTADO: 1 },
                include: [{
                    model: rol,
                    where: { DESCRIPCION: "Coordinador Programa" },
                    attributes: []
                }],
                attributes: []
            }, {
                model: programa,
                as: "FACULTAD",
                attributes: ["ID_PROGRAMA", "NOMBRE"]
            }],
            attributes: [],
            group: ["PROGRAMA.ID_FACULTAD"],
            where: { ESTADO: 1 }
        });
        res.status(201).json({ facultades: facultades });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

controllers.listarFacultadesDeUnTutor = async (req, res) => {
    try {        // lista las facultades de un tutor
        const facultades = await programa.findAll({
            include: [{
                model: rolXUsuarioXPrograma,
                where: { ID_USUARIO: req.params.idTutor, ESTADO: 1 },
                include: [{
                    model: rol,
                    where: { DESCRIPCION: "Tutor" },
                    attributes: []
                }],
                attributes: []
            }, {
                model: programa,
                as: "FACULTAD",
                attributes: ["ID_PROGRAMA", "NOMBRE", "ANTICIPACION_DISPONIBILIDAD"]
            }],
            attributes: [],
            group: ["PROGRAMA.ID_FACULTAD"],
            where: { ESTADO: 1 }
        });
        res.status(201).json({ facultades: facultades });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

controllers.listarProgramasDeUnCoordinador = async (req, res) => {
    try {        // lista los programas de un coordinador de programa segun una facultad
        const programas = await programa.findAll({
            include: [{
                model: rolXUsuarioXPrograma,
                where: { ID_USUARIO: req.params.idCoordinador, ESTADO: 1 },
                include: [{
                    model: rol,
                    where: { DESCRIPCION: "Coordinador Programa" },
                    attributes: []
                }],
                attributes: []
            }],
            where: {
                ID_FACULTAD: req.params.idFacultad,
                ESTADO: 1
            },
            attributes: ["ID_PROGRAMA", "NOMBRE"]
        });
        res.status(201).json({ programas: programas });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}


controllers.listarProgramasYFacultadesPorCoordinador = async (req, res) => { // lista facultades y programas por coordinador
    try {
        const programas = await rolXUsuarioXPrograma.findAll(
            {
                //include: [institucion]
                include: {
                    model: programa,
                    where: { ESTADO: 1 }
                },
                where: {
                    ID_USUARIO: req.params.id,
                    ID_ROL: 2,
                    ESTADO: 1
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
                        ID_FACULTAD: { [Op.ne]: null },
                        ESTADO: 1
                    },
                    include: {
                        model: programa,
                        as: 'FACULTAD',
                    }
                },
                where: {
                    ID_USUARIO: idCoordinador,
                    ID_ROL: 2,
                    ESTADO: 1
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
                        ID_FACULTAD: { [Op.ne]: null },
                        ESTADO: 1
                    },
                    include: {
                        model: programa,
                        as: 'FACULTAD',
                    }
                },
                where: {
                    ID_USUARIO: idCoordinador,
                    ID_ROL: 2,
                    ESTADO: 1
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

// controllers.listarFacultad = async (req, res) => {
//     try {
//         const facultades = await rolXUsuarioXPrograma.findAll(
//             {
//                 include: [
//                     {
//                         model: programa,
//                         where: {
//                             [Op.or]: [
//                                 { ID_FACULTAD: null },
//                                 sequelize.where(sequelize.col('PROGRAMA.ID_FACULTAD'), '=', sequelize.col('PROGRAMA.ID_PROGRAMA'))
//                             ]
//                         }
//                     },
//                     {
//                         model: coordinador
//                     },
//                     {
//                         model: rol,
//                         where: { DESCRIPCION: "Coordinador Facultad" }
//                     }
//                 ]
//             }
//         );
//         res.status(201).json({ facultad: facultades });
//     } catch (error) {
//         res.json({ error: error.message });
//     }
// };
controllers.listarFacultad = async (req, res) => {
    try {
        const facultades = await programa.findAll(
            {
                where: {
                    [Op.or]: [
                        { ID_FACULTAD: null },
                        sequelize.where(sequelize.col('PROGRAMA.ID_FACULTAD'), '=', sequelize.col('PROGRAMA.ID_PROGRAMA'))
                    ],
                    ESTADO: 1
                }
            }
        );
        res.status(201).json({ facultad: facultades });
    } catch (error) {
        res.json({ error: error.message });
    }
};

controllers.getFacultad = async (req, res) => { // devuelve los datos de una facultad (incluye coordinador) 
    const { id } = req.params;
    try {
        const facultad = await programa.findOne(
            {
                where: {
                    ID_PROGRAMA: id,
                    ESTADO: 1
                },
                include: {
                    model: coordinador,
                    include: {
                        model: rol,
                        where: { DESCRIPCION: "Coordinador Facultad" }
                    }

                }
            }
        );
        res.status(201).json({ facultad: facultad });
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
    const { ID_INSTITUCION, NOMBRE, IMAGEN, INDEPENDIENTE, DIAS_DISP } = req.body.facultad;
    console.log("GOT: ", req.body.facultad);//solo para asegurarme de que el objeto llego al backend

    try {
        const facultades = await programa.findAll(
            {
                where: {
                    [Op.or]: [
                        { ID_FACULTAD: null },
                        sequelize.where(sequelize.col('PROGRAMA.ID_FACULTAD'), '=', sequelize.col('PROGRAMA.ID_PROGRAMA'))
                    ],
                    ESTADO: 1
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
            IMAGEN: IMAGEN,
            ANTICIPACION_DISPONIBILIDAD: DIAS_DISP
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
                    ID_FACULTAD: ID_FACULTAD,
                    ESTADO: 1
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
    const { ID_PROGRAMA, ID_INSTITUCION, NOMBRE, IMAGEN, DIAS_DISP, DIAS_CITA, INDEPENDIENTE } = req.body.facultad;
    console.log("GOT: ", req.body.facultad);//solo para asegurarme de que el objeto llego al backend
    try {
        const facultades = await programa.findAll(
            {
                where: {
                    ID_PROGRAMA: { [Op.not]: ID_PROGRAMA },
                    [Op.or]: [
                        { ID_FACULTAD: null },
                        sequelize.where(sequelize.col('PROGRAMA.ID_FACULTAD'), '=', sequelize.col('PROGRAMA.ID_PROGRAMA'))
                    ],
                    ESTADO: 1
                }
            }
        );
        // Validar que el nombre no este duplicado
        for (var i = 0; i < facultades.length; i++) {
            if (facultades[i].NOMBRE.trim() === NOMBRE.trim()) {
                res.status(409).json({ modificacion: { ok: 0 } });
                return
            };
        }
        const ID_FACULTAD = INDEPENDIENTE ? ID_PROGRAMA : null
        const facultadModificada = await programa.update(
            {
                ID_INSTITUCION: ID_INSTITUCION,
                NOMBRE: NOMBRE,
                IMAGEN: IMAGEN,
                ANTICIPACION_DISPONIBILIDAD: DIAS_DISP,
                ANTICIPACION_CANCELAR_CITA: DIAS_CITA,
                ID_FACULTAD: ID_FACULTAD
            },
            { where: { ID_PROGRAMA: ID_PROGRAMA } },
            { transaction: transaccion }
        );

        await transaccion.commit();
        res.status(201).json({ modificacion: { ok: 1 } });
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
        const programasPorFacultad = await programa.findAll(
            {
                //include: [institucion]
                include: {
                    model: programa,
                    as: 'FACULTAD',
                },
                where: {
                    ID_FACULTAD: ID_FACULTAD,
                    ESTADO: 1
                }
            }
        );
        // Validar que el nombre no este duplicado
        for (var i = 0; i < programasPorFacultad.length; i++) {
            if (programasPorFacultad[i].NOMBRE.trim() === NOMBRE.trim()) {
                res.status(409).json({ modificacion: { ok: 0 } });
                return
            };
        }

        const programaModificado = await programa.update({
            ID_FACULTAD: ID_FACULTAD,
            ID_INSTITUCION: ID_INSTITUCION,
            NOMBRE: NOMBRE,
            IMAGEN: IMAGEN
        }, {
            where: { ID_PROGRAMA: ID_PROGRAMA }
        }, { transaction: transaccion });

        await transaccion.commit();
        res.status(201).json({ modificacion: { ok: 1 } });
    } catch (error) {
        //console.log("err0");
        await transaccion.rollback();
        res.json({ error: error.message })
    }

};

controllers.listarProgramasDeUnTutor = async (req, res) => {
    try {        // lista los programas de un tutor
        const programas = await programa.findAll({
            include: [{
                model: rolXUsuarioXPrograma,
                where: { ID_USUARIO: req.params.idTutor, ESTADO: 1 },
                include: [{
                    model: rol,
                    where: { DESCRIPCION: "Tutor" },
                    attributes: []
                }],
                attributes: []
            }],
            attributes: ["ID_PROGRAMA", "NOMBRE"],
            where: { ESTADO: 1 }
        });
        res.status(201).json({ programas: programas });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

controllers.listarProgramasDeUnAlumno = async (req, res) => {
    try {        // lista los programas de un tutor
        const programas = await programa.findAll({
            include: [{
                model: rolXUsuarioXPrograma,
                where: { ID_USUARIO: req.params.idAlumno, ESTADO: 1 },
                include: [{
                    model: rol,
                    where: { DESCRIPCION: "Alumno" },
                    attributes: []
                }],
                attributes: []
            }],
            attributes: ["ID_PROGRAMA", "NOMBRE"],
            where: { ESTADO: 1 }
        });
        res.status(201).json({ programas: programas });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

controllers.listarPoliticasPorFacultad = async (req, res) => {
    try {        // lista las politicas de una facultad especifica
        const politicas = await programa.findOne({
            where: {
                ID_PROGRAMA: req.params.idFacultad,
                ESTADO: 1
            },
            attributes: ["ANTICIPACION_DISPONIBILIDAD", "ANTICIPACION_CANCELAR_CITA"]
        });
        res.status(201).json({ politicas: politicas });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

controllers.listarProgramasDeUnTutorSegunFacultad = async (req, res) => {
    try {        // lista los programas de un tutor segun una facultad
        const programas = await programa.findAll({
            include: [{
                model: rolXUsuarioXPrograma,
                where: { ID_USUARIO: req.params.idTutor, ESTADO: 1 },
                include: [{
                    model: rol,
                    where: { DESCRIPCION: "Tutor" },
                    attributes: []
                }],
                attributes: []
            }],
            where: {
                ID_FACULTAD: req.params.idFacultad,
                ESTADO: 1
            },
            attributes: ["ID_PROGRAMA", "NOMBRE"]
        });
        res.status(201).json({ programas: programas });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

controllers.eliminarFacultad = async (req, res) => {
    const transaccion = await sequelize.transaction();
    const { id } = req.params;

    try {
        const programasAsociados = await programa.findOne(
            {
                where: {
                    ID_FACULTAD: id,
                    ESTADO: 1,
                    [Op.not]: [
                        sequelize.where(sequelize.col('PROGRAMA.ID_FACULTAD'), '=', sequelize.col('PROGRAMA.ID_PROGRAMA'))
                    ]
                }
            }
        );

        const usuariosAsociados = await rolXUsuarioXPrograma.findOne(
            {
                where: {
                    ID_PROGRAMA: id,
                    ESTADO: 1
                }
            }
        );

        const procesosTutoriaAsociados = await tutoria.findOne(
            {
                where: {
                    ID_PROGRAMA: id,
                    ESTADO: 1
                }
            }
        );

        if (programasAsociados || procesosTutoriaAsociados || usuariosAsociados) {
            if (programasAsociados) {
                boolProgramas = 1;
            }
            else {
                boolProgramas = 0;
            }

            if (procesosTutoriaAsociados) {
                boolTutoria = 1;
            }
            else {
                boolTutoria = 0;
            }

            if (usuariosAsociados) {
                boolUsuario = 1;
            } else {
                boolUsuario = 0;
            }

            res.json({ eliminacion: { ok: 0, programasAsociados: boolProgramas, tutoriasAsociadas: boolTutoria, usuariosAsociados: boolUsuario } });
            return;
        }

        const programaModificado = await programa.update(
            { ESTADO: 0 },
            { where: { ID_PROGRAMA: id } },
            { transaction: transaccion }
        );

        await transaccion.commit();
        res.status(201).json({ eliminacion: { ok: 1, programasAsociados: 0, tutoriasAsociadas: 0, usuariosAsociados: 0 } });
    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }

};

controllers.eliminarPrograma = async (req, res) => {
    const transaccion = await sequelize.transaction();
    const { id } = req.params;

    try {
        const usuariosAsociados = await rolXUsuarioXPrograma.findOne(
            {
                where: {
                    ID_PROGRAMA: id,
                    ESTADO: 1
                }
            }
        );

        const procesosTutoriaAsociados = await tutoria.findOne(
            {
                where: {
                    ID_PROGRAMA: id,
                    ESTADO: 1
                }
            }
        );

        if (procesosTutoriaAsociados || usuariosAsociados) {
            if (procesosTutoriaAsociados) {
                boolTutoria = 1;
            }
            else {
                boolTutoria = 0;
            }

            if (usuariosAsociados) {
                boolUsuario = 1;
            } else {
                boolUsuario = 0;
            }

            res.json({ eliminacion: { ok: 0, tutoriasAsociadas: boolTutoria, usuariosAsociados: boolUsuario } });
            return;
        }

        const programaModificado = await programa.update(
            { ESTADO: 0 },
            { where: { ID_PROGRAMA: id } },
            { transaction: transaccion }
        );

        await transaccion.commit();
        res.status(201).json({ eliminacion: { ok: 1, tutoriasAsociadas: 0, usuariosAsociados: 0 } });
    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }

};

controllers.listarFacultadesDeUnAlumno = async (req, res) => {
    try {        // lista las facultades de un alumno
        const facultades = await programa.findAll({
            include: [{
                model: rolXUsuarioXPrograma,
                where: { ID_USUARIO: req.params.idAlumno, ESTADO: 1 },
                include: [{
                    model: rol,
                    where: { DESCRIPCION: "Alumno" },
                    attributes: []
                }],
                attributes: []
            }, {
                model: programa,
                as: "FACULTAD",
                attributes: ["ID_PROGRAMA", "NOMBRE"]
            }],
            attributes: [],
            group: ["PROGRAMA.ID_FACULTAD"],
            where: { ESTADO: 1 }
        });
        res.status(201).json({ facultades: facultades });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

module.exports = controllers;