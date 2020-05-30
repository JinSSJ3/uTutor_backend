const controllers = {}
const Sequelize = require("sequelize");
let sequelize = require('../models/database');
let asignacionTutoria = require('../models/asignacionTutoria');
let tutor = require('../models/tutor');
let alumno = require('../models/alumno');
let procesoTutoria = require('../models/procesoTutoria');
let asignacionTutoriaXAlumno = require('../models/asignacionTutoriaXAlumno');

controllers.listarPorTutoria = async (req, res) => {
    const idTutoria = req.query.tutoria;
    try {
        const dataAsignaciones = await asignacionTutoria.findAll({
            include: [tutor,
                {
                    model: alumno,
                    as: "ALUMNOS"
                }
            ],
            where: {
                ESTADO: 1,
                ID_PROCESO_TUTORIA: idTutoria
            }
        });
        res.status(201).json({ asignaciones: dataAsignaciones });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};

controllers.get = async (req, res) => { // devuelve los datos de una asignacion 
    try {
        const idAsignacion = req.params.id;
        const dataAsignacion = await asignacionTutoria.findOne({
            where:{
                ID_ASIGNACION: idAsignacion,
                ESTADO: 1
            },
            include: [tutor,
                {
                    model: alumno,
                    as: "ALUMNOS"
                },
                {
                    model: procesoTutoria,
                    as: "PROCESO_TUTORIA"
                }
            ]
        })
        res.status(201).json({ asignacion: dataAsignacion });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

controllers.lista = async (req, res) => { // devuelve los datos de todas las asignaciones
    try {
        const dataAsignacion = await asignacionTutoria.findAll({
            where:{
                ESTADO: 1
            },
            include: [tutor,
                {
                    model: alumno,
                    as: "ALUMNOS"
                },
                {
                    model: procesoTutoria,
                    as: "PROCESO_TUTORIA"
                }
            ]
        })
        res.status(201).json({ asignaciones: dataAsignacion });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

/**
 * @returns La nueva asignacion creado en formato Json()
 * HTTP status code 201 significa que se creo exitosamente
 */
controllers.registrar = async (req, res) => {
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio una "asignacion" en el cuerpo ("body") del request ("req")
     *  */
    const transaccion = await sequelize.transaction();
    const { PROCESO_TUTORIA, TUTOR, ALUMNOS, FECHA_ASIGNACION } = req.body.asignacionTutoria;
    console.log("GOT: ", req.body.asignacion); //solo para asegurarme de que el objeto llego al backend
    try {
        const nuevaAsignacionTutoria = await asignacionTutoria.create({
            ID_PROCESO_TUTORIA: PROCESO_TUTORIA,
            ID_TUTOR: TUTOR,
            FECHA_ASIGNACION: FECHA_ASIGNACION,
            ESTADO: 1
        }, { transaction: transaccion })
            .then(async result => {
                for (element of ALUMNOS) {
                    const nuevaAsignacionTutoriaXAlumno = await asignacionTutoriaXAlumno.create({
                        ID_ALUMNO: element,
                        ID_ASIGNACION: result.ID_ASIGNACION
                    }, { transaction: transaccion })
                };
                await transaccion.commit();
                res.status(201).json({ asignacion: result });
            })
    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }

};

// No se estan modificando alumnos
// controllers.modificar = async (req, res) => {

//     const transaccion = await sequelize.transaction();
//     const { ID, PROCESO_TUTORIA, TUTOR, ALUMNOS, FECHA_ASIGNACION } = req.body.asignacionTutoria;
//     //  console.log("GOT: ", PROGRAMA);//solo para asegurarme de que el objeto llego al backend
//     try {
//         const asignacionTutoriaModificada = await asignacionTutoria.update({
//             ID_PROCESO_TUTORIA: PROCESO_TUTORIA,
//             ID_TUTOR: TUTOR,
//             FECHA_ASIGNACION: FECHA_ASIGNACION,
//             ESTADO: 1
//         }, {
//             where: { ID_ASIGNACION: ID }
//         }, { transaction: transaccion })
//             .then(async result => {
//                 await asignacionTutoriaXAlumno.destroy({
//                     where: { ID_ASIGNACION: ID }
//                 }, { transaction: transaccion });

//                 for (element of ALUMNOS) {
//                     const nuevaAsignacionTutoriaXAlumno = await asignacionTutoriaXAlumno.create({
//                         ID_ALUMNO: element,
//                         ID_ASIGNACION: ID
//                     }, { transaction: transaccion })
//                 };
//                 await transaccion.commit();
//                 res.status(201).json({ asignacion: result });
//             })
//     } catch (error) {
//         await transaccion.rollback();
//         res.json({ error: error.message })
//     }

// };

controllers.eliminar = async (req, res) => {

    const transaccion = await sequelize.transaction();
    try {
        const asignacionTutoriaEliminada = await asignacionTutoria.update(
            {
                ESTADO: 0
            }, 
            {
                where: { ID_ASIGNACION: req.params.id }
            }, 
            { 
                transaction: transaccion 
            }
        );
        await transaccion.commit();
        res.status(201).json({ resultado: "success" });
    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }

};

module.exports = controllers;