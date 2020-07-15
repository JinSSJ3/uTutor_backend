const controllers = {}
const Sequelize = require("sequelize");
let sequelize = require('../models/database');
let usuario = require('../models/usuario');
let alumno = require('../models/alumno');
//let rolXUsuario = require("../models/rolXUsuario");
let rol = require("../models/rol");
let rolXUsuarioXPrograma = require("../models/rolXUsuarioXPrograma");
let asignacionTutoria = require("../models/asignacionTutoria");
let etiquetaXAlumno = require("../models/etiquetaXAlumno");
let programa = require("../models/programa");
let asignacionTutoriaXAlumno = require("../models/asignacionTutoriaXAlumno");
let etiqueta = require("../models/etiqueta");
let informacionRelevante = require("../models/informacionRelevante");
const fsPath = require('fs-path');
const fs = require('fs');
const path = require('path');


const Op = Sequelize.Op;

controllers.listar = async (req, res) => { // fetch all all studenst from DB
    try {
        const alumnos = await alumno.findAll({
            include: {
                model: usuario,
                include: { model: rolXUsuarioXPrograma, where: { 'ESTADO': 1 } },
            }
        });
        res.status(201).json({ alumnos: alumnos });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};

controllers.listarPorTutoria = async (req, res) => { // Lista a los alumnos de un tutor de una tutoria determinado
    try {
        const alumnos = await asignacionTutoria.findAll({
            include: {
                model: asignacionTutoriaXAlumno,
                required: true,
                include: [{
                    model: alumno,
                    include: [{
                        model: usuario,
                        include: [programa],
                        required: true
                    }],
                    required: true
                }]
            },
            where: {
                ESTADO: 1,
                ID_TUTOR: req.params.tutor,
                ID_PROCESO_TUTORIA: req.params.tutoria
            },
        });
        console.log("dsfds")
        res.status(201).json({ alumnos: alumnos });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};


controllers.BuscarPorNombreTutoria = async (req, res) => { // Lista a los alumnos de un tutor de una tutoria determinado
    try {
        const alumnos = await asignacionTutoria.findAll({
            include: {
                model: asignacionTutoriaXAlumno,
                required: true,
                include: [{
                    model: alumno,
                    include: [{
                        model: usuario,
                        include: [programa],
                        required: true,
                        where: {
                            [Op.or]: [{ NOMBRE: { [Op.like]: '%' + req.params.nombre + '%' } },
                            { APELLIDOS: { [Op.like]: '%' + req.params.nombre + '%' } }]
                        },
                    }],
                    required: true
                }]
            },
            where: {
                ESTADO: 1,
                ID_TUTOR: req.params.tutor,
                ID_PROCESO_TUTORIA: req.params.tutoria
            },
        });
        res.status(201).json({ alumnos: alumnos });
    } catch (error) {
        res.json({ error: error.message });
    }
};

controllers.listarPorPrograma = async (req, res) => { // Lista a los alumnos de un programa determinado
    try {
        const alumnos = await rolXUsuarioXPrograma.findAll({
            include: [{
                model: rol,
                where: { DESCRIPCION: "Alumno" }
            }, {
                model: usuario,
                required: true,
                include: {
                    model: alumno,
                    include: {
                        model: etiquetaXAlumno,
                        include: {
                            model: etiqueta
                        }
                    }
                }
            }],
            where: {
                ID_PROGRAMA: req.params.programa,
                ESTADO: 1
            }
        });
        res.status(201).json({ alumnos: alumnos });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};


controllers.get = async (req, res) => { // devuelve los datos de un alumno 
    try {
        const { id } = req.params;
        const data = await alumno.findOne({
            where: { ID_ALUMNO: id },
            include: [{
                model: usuario,
                include: [rol, programa]
            }, etiqueta]
        })
        /*const data = await usuario.findOne({  validar contrasena
            where: {ID_USUARIO: id}
        })
        .then(async result => { 
            console.log(await result.validPassword("contra"));
        })*/

        res.status(201).json({ alumno: data });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

controllers.buscarPorCodigo = async (req, res) => { // devuelve los datos de un alumno segun su codigo
    try {
        const data = await alumno.findOne({
            include: [{
                model: usuario,
                where: { CODIGO: req.params.codigo },
                include: [rol, programa]
            }, etiqueta]
        })
        res.status(201).json({ alumno: data });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

/**
 * @returns El nuevo student creado en formato Json()
 * HTTP status code 201 significa que se creo exitosamente
 */
controllers.registrar = async (req, res) => {
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio un "student" en el cuerpo ("body") del request ("req")
     *  */
    const transaccion = await sequelize.transaction();
    const { NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, CONTRASENHA, IMAGEN, PROGRAMA, ETIQUETA } = req.body.alumno;
    console.log(">>>>>>GOT: ", req.body.alumno);//solo para asegurarme de que el objeto llego al backend
    try {
        const nuevoAlumno = await usuario.create({
            USUARIO: USUARIO,
            CONTRASENHA: CONTRASENHA,
            NOMBRE: NOMBRE,
            APELLIDOS: APELLIDOS,
            CORREO: CORREO,
            CODIGO: CODIGO,
            TELEFONO: TELEFONO,
            DIRECCION: DIRECCION,
            IMAGEN: IMAGEN
        }, { transaction: transaccion })
            .then(async result => {
                const validacionCodigo = await usuario.findOne({
                    where: { CODIGO: CODIGO },
                    include: [{
                        model: rolXUsuarioXPrograma,
                        attributes: ["ESTADO"],
                        include: [{
                            model: programa,
                            attributes: ["ID_PROGRAMA", "NOMBRE"],
                            include: {
                                model: programa,
                                as: "FACULTAD",
                                attributes: ["ID_FACULTAD", "NOMBRE"]
                            }
                        }, rol]
                    }]
                })

                const validacionCorreo = await usuario.findOne({
                    where: { CORREO: CORREO }
                })

                if (!validacionCodigo && !validacionCorreo) {
                    const nuevo = await alumno.create({
                        ID_ALUMNO: result.ID_USUARIO
                    }, { transaction: transaccion })

                    const idRol = await rol.findOne({
                        attributes: ["ID_ROL"],
                        where: { DESCRIPCION: "Alumno" }
                    }, { transaction: transaccion })

                    /*             const rolDeUsuario = await rolXUsuario.create({
                                    ID_USUARIO: result.ID_USUARIO,
                                    ID_ROL: idRol.ID_ROL
                                }, {transaction: transaccion})       */


                    for (element of PROGRAMA) {
                        const programaDeUsuario = await rolXUsuarioXPrograma.create({
                            ID_USUARIO: result.ID_USUARIO,
                            ID_PROGRAMA: element,
                            ID_ROL: idRol.ID_ROL,
                            ESTADO: '1'
                        }, { transaction: transaccion })
                    }

                    for (element of ETIQUETA) {
                        const etiquetaDeAlumno = await etiquetaXAlumno.create({
                            ID_ALUMNO: result.ID_USUARIO,
                            ID_ETIQUETA: element
                        }, { transaction: transaccion })
                    }
                    await transaccion.commit();
                    res.status(201).json({ alumno: result });
                } else {
                    await transaccion.rollback();
                    if (validacionCodigo && validacionCorreo) {
                        res.json({ error: "Codigo y correo repetido", usuario: validacionCodigo })
                    } else if (validacionCodigo) {
                        res.json({ error: "Codigo repetido", usuario: validacionCodigo })
                    } else if (validacionCorreo) {
                        res.json({ error: "Correo repetido", usuario: validacionCorreo })
                    }
                }
            });
    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }

};

controllers.modificar = async (req, res) => {

    const transaccion = await sequelize.transaction();
    const { ID, NOMBRE, APELLIDOS, CODIGO, CORREO, TELEFONO, DIRECCION, USUARIO, IMAGEN, PROGRAMA, ETIQUETA } = req.body.alumno;
    console.log(">>>>>>GOT: ", req.body.alumno);//solo para asegurarme de que el objeto llego al backend
    try {
        const nuevoAlumno = await usuario.update({
            USUARIO: USUARIO,
            NOMBRE: NOMBRE,
            APELLIDOS: APELLIDOS,
            CORREO: CORREO,
            CODIGO: CODIGO,
            TELEFONO: TELEFONO,
            DIRECCION: DIRECCION,
            IMAGEN: IMAGEN
        }, {
            where: { ID_USUARIO: ID },
            transaction: transaccion
        })

        const validacionCodigo = await usuario.findOne({
            where: { ID_USUARIO: { [Op.not]: ID }, CODIGO: CODIGO },
            include: [{
                model: rolXUsuarioXPrograma,
                attributes: ["ESTADO"],
                include: [{
                    model: programa,
                    attributes: ["ID_PROGRAMA", "NOMBRE"],
                    include: {
                        model: programa,
                        as: "FACULTAD",
                        attributes: ["ID_FACULTAD", "NOMBRE"]
                    }
                }, rol]
            }]
        })

        const validacionCorreo = await usuario.findOne({
            where: { ID_USUARIO: { [Op.not]: ID }, CORREO: CORREO }
        })

        if (!validacionCodigo && !validacionCorreo) {
            await etiquetaXAlumno.destroy({
                where: { ID_ALUMNO: ID },
                transaction: transaccion
            })

            const idRol = await rol.findOne({
                attributes: ["ID_ROL"],
                where: { DESCRIPCION: "Alumno" }
            }, { transaction: transaccion })

            await rolXUsuarioXPrograma.destroy({
                where: { ID_USUARIO: ID },
                transaction: transaccion
            })

            for (element of PROGRAMA) {
                const programaDeUsuario = await rolXUsuarioXPrograma.create({
                    ID_USUARIO: ID,
                    ID_PROGRAMA: element,
                    ID_ROL: idRol.ID_ROL,
                    ESTADO: 1
                }, { transaction: transaccion })
            }

            for (element of ETIQUETA) {
                const etiquetaDeAlumno = await etiquetaXAlumno.create({
                    ID_ALUMNO: ID,
                    ID_ETIQUETA: element
                }, { transaction: transaccion })
            }
            await transaccion.commit();
            res.status(201).json({ alumno: req.body.alumno });
        } else {
            await transaccion.rollback();
            if (validacionCodigo && validacionCorreo) {
                res.json({ error: "Codigo y correo repetido", usuario: validacionCodigo })
            } else if (validacionCodigo) {
                res.json({ error: "Codigo repetido", usuario: validacionCodigo })
            } else if (validacionCorreo) {
                res.json({ error: "Correo repetido", usuario: validacionCorreo })
            }
        }
    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }
};

controllers.eliminar = async (req, res) => {

    const transaccion = await sequelize.transaction();
    try {
        const idRol = await rol.findOne({
            attributes: ["ID_ROL"],
            where: { DESCRIPCION: "Alumno" }
        }, { transaction: transaccion })

        const coordinadorModificado = await rolXUsuarioxPrograma.update({
            ESTADO: 0
        }, {
            where: {
                ID_USUARIO: req.params.id,
                ID_ROL: idRol.ID_ROL
            }
        }, { transaction: transaccion })
        await transaccion.commit()
        res.status(201).json({ status: "success" })
    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }

};

controllers.registrarInformacionRelevante = async (req, res) => {

    const transaccion = await sequelize.transaction();
    const { ID_ALUMNO, ARCHIVO, DESCRIPCION, EXTENSION } = req.body.archivo;
    try {
        let nombreArchivo = DESCRIPCION.split(".")[0] + "." + EXTENSION
        let archivos = await informacionRelevante.findOne({
            where: {
                ID_ALUMNO: ID_ALUMNO,
                DESCRIPCION: nombreArchivo
            }
        })
        if (archivos) {
            res.status(201).json({ error: "Nombre de archivo repetido" });
            return;
        } 

        let ruta = ARCHIVO ? path.join("..", "Archivos", "Alumnos", ID_ALUMNO.toString(), DESCRIPCION + "." + EXTENSION) : null;
        if (ARCHIVO) {
            let data = new Buffer.from(ARCHIVO.split(";base64,")[1], "base64");
            fsPath.writeFile(ruta, data, function (err) {
                if (err) {
                    return console.log(err);
                }
            })
        }
        console.log("ruta: ", ruta);
        
        const nuevaInformacionRelevante = await informacionRelevante.create({
            ID_ALUMNO: ID_ALUMNO,
            DESCRIPCION: nombreArchivo,
            ARCHIVO: ruta
        }, { transaction: transaccion })
        res.status(201).json({ informacionRelevante: nuevaInformacionRelevante });
        await transaccion.commit();
    } catch (error) {
        await transaccion.rollback();
        res.json({ error: error.message })
    }

};

controllers.listarArchivosInfoRelevante = async (req, res) => {  // lista los archivos relevantes de un alumno
    try {
        const infoRelevante = await informacionRelevante.findAll({
            where: { ID_ALUMNO: req.params.idAlumno },
            attributes: ["ID_INFORMACION_RELEVANTE", "DESCRIPCION"]
        })
        res.status(201).json({ informacionRelevante: infoRelevante });
    } catch (error) {
        res.json({ error: error.message })
    }

};

controllers.devolverArchivoInfoRelevante = async (req, res) => {  // lista los archivos relevantes de un alumno
    try {        
        const infoRelevante = await informacionRelevante.findOne({
            where: {ID_INFORMACION_RELEVANTE: req.params.idArchivo},
            attributes: ["DESCRIPCION", "ARCHIVO"] 
        })
        console.log(infoRelevante.ARCHIVO)
        if (infoRelevante.ARCHIVO){
            infoRelevante.ARCHIVO = fs.readFileSync(infoRelevante.ARCHIVO, "base64")
        }
        res.status(201).json({informacionRelevante: infoRelevante});
    }catch (error) {
        res.json({error: error.message})
    }


};

controllers.listarNoAsignadosPorProgramaYTutoria = async (req, res) => { // Lista a los alumnos de un programa determinado
    try {
        const { QueryTypes } = require('sequelize');
        const alumnos = await sequelize.query("SELECT ID_USUARIO, NOMBRE,APELLIDOS, CORREO from USUARIO, ALUMNO " +
        " WHERE USUARIO.ID_USUARIO NOT IN (SELECT ID_ALUMNO FROM ASIGNACION_TUTORIA_X_ALUMNO, ASIGNACION_TUTORIA " + 
        " WHERE ASIGNACION_TUTORIA.ID_ASIGNACION = ASIGNACION_TUTORIA_X_ALUMNO.ID_ASIGNACION AND ASIGNACION_TUTORIA.ID_PROCESO_TUTORIA = " + req.params.idTutoria + 
        " AND SOLICITUD = 1 AND ESTADO = 1) AND ID_USUARIO = ID_ALUMNO", { type: QueryTypes.SELECT });
        res.status(201).json({ alumnos: alumnos });
    }
    catch (error) {
        res.json({ error: error.message });
    }
};

module.exports = controllers;