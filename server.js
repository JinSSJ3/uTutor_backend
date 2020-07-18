const express = require('express');
const dotenv = require('dotenv');
let sequelize = require('./src/models/database');
const alumno = require('./src/models/alumno');
const etiqueta = require('./src/models/etiqueta');
const etiquetaXAlumno = require('./src/models/etiquetaXAlumno');
const areaApoyoXSesion = require('./src/models/areaApoyoXSesion');
const sesion = require('./src/models/sesion');
const morgan = require("morgan");
const tutor = require('./src/models/tutor');
const asignacionTutoria = require('./src/models/asignacionTutoria');
const procesoTutoria = require('./src/models/procesoTutoria');
const alumnoXSesion = require('./src/models/alumnoXSesion');
const usuario = require('./src/models/usuario');
const bodyParser = require('body-parser');
const rol = require('./src/models/rol');
const programa = require('./src/models/programa');
const rolXUsuarioXPrograma = require('./src/models/rolXUsuarioXPrograma');
const institucion = require('./src/models/institucion');
const informacionRelevante = require('./src/models/informacionRelevante');
const notificacion = require('./src/models/notificacion');
const etiquetaXTutoria = require('./src/models/etiquetaXTutoria');
const encuesta = require('./src/models/encuesta');
const disponibilidad = require('./src/models/disponibilidad');
const compromiso = require('./src/models/compromiso');
const asignacionTutoriaXAlumno = require('./src/models/asignacionTutoriaXAlumno');
const areaApoyo = require('./src/models/areaApoyo');
const mysql = require('mysql2/promise');
const { QueryInterface, Sequelize } = require('sequelize');

dotenv.config();

/* sample draft server 
* Author: Jin Jose Manuel
* Date: 20/04/2020
**/

app = express();

//app.use(express.json());
app.use(bodyParser.json({ limit: '10MB', extended: true }))

// Settings
app.set("port", process.env.PORT);

const dbName = process.env.DATABASE;
mysql.createConnection({
    host: process.env.HOST,
    port: Number(process.env.PORTDB),
    user: process.env.USR,
    password: process.env.PSSW,
}).then(connection => {
    connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`).then((res) => {
        console.info("Database create or successfully checked");
        sequelize.sync().then(async result => {
            const datos = await institucion.findOne();
            const tran = await sequelize.transaction();
            try {
                if (!datos) {
                    const nuevaInstitucion = await institucion.create({
                        NOMBRE: "",
                        INICIALES: "",
                        IMAGEN: null,
                        TELEFONO: "",
                        PAGINA_WEB: "",
                        UBICACION: "",
                        DOMINIO: "",
                        DOMINIO2: ""
                    }, { transaction: tran })

                    
                    await rol.create({
                        ID_ROL: 1,
                        DESCRIPCION: "Administrador"
                    }, { transaction: tran })

                    await rol.create({
                        ID_ROL: 2,
                        DESCRIPCION: "Coordinador Programa"
                    }, { transaction: tran })

                    await rol.create({
                        ID_ROL: 3,
                        DESCRIPCION: "Tutor"
                    }, { transaction: tran })

                    await rol.create({
                        ID_ROL: 4,
                        DESCRIPCION: "Alumno"
                    }, { transaction: tran })

                    await rol.create({
                        ID_ROL: 5,
                        DESCRIPCION: "Usuario de soporte"
                    }, { transaction: tran })

                    await rol.create({
                        ID_ROL: 6,
                        DESCRIPCION: "Coordinador Facultad"
                    }, { transaction: tran })

                    await etiqueta.create({
                        ID_ETIQUETA: 1,
                        DESCRIPCION: "Permanencia"
                    }, { transaction: tran })

                    await etiqueta.create({
                        ID_ETIQUETA: 2,
                        DESCRIPCION: "Tercera matrícula"
                    }, { transaction: tran })

                    const admin = await usuario.create({
                        USUARIO: "luis.miguel",
                        CONTRASENHA: "admin",
                        NOMBRE: "Luis Miguel",
                        APELLIDOS: "Guanira Contreras",
                        CORREO: "luis.miguel@pucp.pe",
                        CODIGO: "19996532",
                        TELEFONO: "932147863",
                        DIRECCION: "Jr. Las flores 131",
                        IMAGEN: null
                    }, { transaction: tran }).then(async result => {
                        const rolUsuario = await rolXUsuarioXPrograma.create({
                            ID_USUARIO: result.ID_USUARIO,
                            ID_ROL: 1,
                            ESTADO: 1
                        }, { transaction: tran })
                    })
                }
                await tran.commit();
            } catch (error) {
                console.log(error.message);
                await tran.rollback();
            }
        }
        );
    })
})





// relaciones que generan conflicto por el orden en el que se crean las tablas
usuario.belongsToMany(rol, { through: {model: rolXUsuarioXPrograma, unique: false}, foreignKey: "ID_USUARIO", otherKey: "ID_ROL" });
usuario.belongsToMany(programa, { through: {model: rolXUsuarioXPrograma, unique: false}, foreignKey: "ID_USUARIO", otherKey: "ID_PROGRAMA" });
rol.belongsToMany(usuario, { through: {model: rolXUsuarioXPrograma, unique: false}, foreignKey: "ID_ROL", otherKey: "ID_USUARIO" });
rol.belongsToMany(programa, { through: {model: rolXUsuarioXPrograma, unique: false}, foreignKey: "ID_ROL", otherKey: "ID_PROGRAMA" });
programa.belongsToMany(usuario, { through: {model: rolXUsuarioXPrograma, unique: false}, foreignKey: "ID_PROGRAMA", otherKey: "ID_USUARIO" });
programa.belongsToMany(rol, { through: {model: rolXUsuarioXPrograma, unique: false}, foreignKey: "ID_PROGRAMA", otherKey: "ID_ROL" });
rolXUsuarioXPrograma.belongsTo(usuario, { foreignKey: "ID_USUARIO" });
rolXUsuarioXPrograma.belongsTo(rol, { foreignKey: "ID_ROL" });
rolXUsuarioXPrograma.belongsTo(programa, { foreignKey: "ID_PROGRAMA" });
usuario.hasMany(rolXUsuarioXPrograma, { foreignKey: "ID_USUARIO" });
programa.hasMany(rolXUsuarioXPrograma, { foreignKey: "ID_PROGRAMA" });
rol.hasMany(rolXUsuarioXPrograma, { foreignKey: "ID_ROL" });
etiqueta.belongsToMany(alumno, { through: etiquetaXAlumno, foreignKey: "ID_ETIQUETA", otherKey: "ID_ALUMNO", as: "ETIQUETA" })
alumno.belongsToMany(etiqueta, { through: etiquetaXAlumno, foreignKey: "ID_ALUMNO", otherKey: "ID_ETIQUETA" })
etiquetaXAlumno.belongsTo(etiqueta, { foreignKey: "ID_ETIQUETA" });
etiquetaXAlumno.belongsTo(alumno, { foreignKey: "ID_ALUMNO" });
etiqueta.hasMany(etiquetaXAlumno, { foreignKey: "ID_ETIQUETA" });
sesion.hasMany(areaApoyoXSesion, { foreignKey: "ID_SESION" })
tutor.hasMany(asignacionTutoria, { foreignKey: "ID_TUTOR" });
procesoTutoria.hasMany(asignacionTutoria, { foreignKey: "ID_PROCESO_TUTORIA" });
sesion.hasMany(alumnoXSesion, { foreignKey: "ID_SESION" });
usuario.hasOne(alumno, { foreignKey: "ID_ALUMNO" });
alumno.belongsTo(usuario, { foreignKey: { name: "ID_ALUMNO" } });
alumno.hasMany(etiquetaXAlumno, { foreignKey: { name: "ID_ALUMNO" } });
alumno.belongsToMany(sesion, { through: alumnoXSesion, foreignKey: "ID_ALUMNO", otherKey: "ID_SESION" })
sesion.belongsToMany(alumno, { through: alumnoXSesion, foreignKey: "ID_SESION", otherKey: "ID_ALUMNO" })
alumnoXSesion.belongsTo(alumno, { foreignKey: "ID_ALUMNO" });
alumnoXSesion.belongsTo(sesion, { foreignKey: "ID_SESION" });
areaApoyo.belongsToMany(sesion, { through: areaApoyoXSesion, foreignKey: "ID_AREA_APOYO", otherKey: "ID_SESION" })
sesion.belongsToMany(areaApoyo, { through: areaApoyoXSesion, foreignKey: "ID_SESION", otherKey: "ID_AREA_APOYO" })
areaApoyoXSesion.belongsTo(areaApoyo, { foreignKey: "ID_AREA_APOYO" });
areaApoyoXSesion.belongsTo(sesion, { foreignKey: "ID_SESION" });
asignacionTutoria.belongsTo(tutor, { foreignKey: "ID_TUTOR" });
asignacionTutoria.belongsTo(procesoTutoria, { foreignKey: "ID_PROCESO_TUTORIA", as: "PROCESO_TUTORIA" });
alumno.belongsToMany(asignacionTutoria, { through: asignacionTutoriaXAlumno, foreignKey: "ID_ALUMNO", otherKey: "ID_ASIGNACION" });
asignacionTutoria.belongsToMany(alumno, { through: asignacionTutoriaXAlumno, foreignKey: "ID_ASIGNACION", otherKey: "ID_ALUMNO", as: "ALUMNOS" });
asignacionTutoriaXAlumno.belongsTo(alumno, { foreignKey: "ID_ALUMNO" });
asignacionTutoriaXAlumno.belongsTo(asignacionTutoria, { foreignKey: "ID_ASIGNACION" });
alumno.hasMany(asignacionTutoriaXAlumno, { foreignKey: "ID_ALUMNO" });
asignacionTutoria.hasMany(asignacionTutoriaXAlumno, { foreignKey: "ID_ASIGNACION" });
compromiso.belongsTo(sesion, { foreignKey: { name: "ID_SESION" } });
sesion.hasMany(compromiso, { foreignKey: { name: "ID_SESION" } });
disponibilidad.belongsTo(tutor, { foreignKey: { name: "ID_TUTOR" } });
disponibilidad.belongsTo(programa, { foreignKey: { name: "ID_FACULTAD" } });
encuesta.belongsTo(alumnoXSesion, { foreignKey: "ID_SESION" });
encuesta.belongsTo(alumnoXSesion, { foreignKey: "ID_ALUMNO" });
etiqueta.belongsToMany(procesoTutoria, { through: etiquetaXTutoria, foreignKey: "ID_ETIQUETA", otherKey: "ID_PROCESO_TUTORIA" })
procesoTutoria.belongsToMany(etiqueta, { through: etiquetaXTutoria, foreignKey: "ID_PROCESO_TUTORIA", otherKey: "ID_ETIQUETA" })
etiquetaXTutoria.belongsTo(etiqueta, { foreignKey: "ID_ETIQUETA" });
etiquetaXTutoria.belongsTo(procesoTutoria, { foreignKey: "ID_PROCESO_TUTORIA" });
informacionRelevante.belongsTo(alumno, { foreignKey: { name: "ID_ALUMNO" } });
alumno.hasMany(informacionRelevante, { foreignKey: { name: "ID_ALUMNO" } });
notificacion.belongsTo(sesion, { foreignKey: "ID_SESION" });
notificacion.belongsTo(usuario, { as: 'EMISOR', foreignKey: "ID_EMISOR" });
notificacion.belongsTo(usuario, { as: 'RECEPTOR', foreignKey: "ID_RECEPTOR" });
programa.belongsTo(institucion, { foreignKey: { name: "ID_INSTITUCION" } });
programa.belongsTo(programa, { as: 'FACULTAD', foreignKey: 'ID_FACULTAD' })
procesoTutoria.belongsTo(programa, {foreignKey:{name:"ID_PROGRAMA"}});
sesion.belongsTo(procesoTutoria, { foreignKey: "ID_PROCESO_TUTORIA" });
sesion.belongsTo(tutor, { foreignKey: "ID_TUTOR" });
tutor.belongsTo(usuario, { foreignKey: { name: "ID_TUTOR" } });

app.use(morgan('dev'));


app.use(require('./src/routes/alumnoRoutes'));
app.use(require('./src/routes/tutorRoutes'));
app.use(require('./src/routes/coordinadorRoutes'));
app.use(require('./src/routes/procesoTutoriaRoutes'));
app.use(require('./src/routes/disponibilidadRoutes'));
app.use(require('./src/routes/programaRoutes'));
app.use(require('./src/routes/sesionRoutes'));
app.use(require('./src/routes/etiquetaRoutes'));
app.use(require('./src/routes/asignacionTutoriaRoutes'));
app.use(require('./src/routes/institucionRoutes'));
app.use(require('./src/routes/usuarioRoutes'));
app.use(require('./src/routes/encuestaRoutes'));
app.use(require('./src/routes/notificacionRoutes'));
app.use(require('./src/routes/areaApoyoRoutes'));
app.use(require('./src/routes/logRoutes'));




app.listen(app.get('port'), () => console.log(`Server running on port ${app.get('port')}`));
