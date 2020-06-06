const express = require('express');
const dotenv = require('dotenv');
let sequelize = require('./src/models/database');
const alumno = require('./src/models/alumno');
const etiqueta = require('./src/models/etiqueta');
const etiquetaXAlumno = require('./src/models/etiquetaXAlumno');
const morgan = require("morgan")

dotenv.config();

/* sample draft server 
* Author: Jin Jose Manuel
* Date: 20/04/2020
**/

app = express();

app.use(express.json());


// Settings
app.set("port", process.env.PORT);


sequelize.sync();

// relaciones que generan conflicto por el orden en el que se crean las tablas
etiqueta.belongsToMany(alumno, {through: etiquetaXAlumno, foreignKey: "ID_ETIQUETA", otherKey: "ID_ALUMNO", as: "ETIQUETA"})
alumno.belongsToMany(etiqueta, {through: etiquetaXAlumno, foreignKey: "ID_ALUMNO", otherKey: "ID_ETIQUETA"})
etiquetaXAlumno.belongsTo(etiqueta,{foreignKey: "ID_ETIQUETA"});
etiquetaXAlumno.belongsTo(alumno,{foreignKey: "ID_ALUMNO"});
etiqueta.hasMany(etiquetaXAlumno,{foreignKey: "ID_ETIQUETA"});


app.use(morgan('dev'));


app.use(require('./src/routes/alumnoRoutes'));
app.use(require('./src/routes/tutorRoutes'));
app.use(require('./src/routes/coordinadorRoutes'));
app.use(require('./src/routes/procesoTutoriaRoutes'));
app.use(require('./src/routes/disponibilidadRoutes'));
app.use(require('./src/routes/programaRoutes'));
app.use(require('./src/routes/sesionRoutes'));
app.use(require('./src/routes/etiquetaRoutes'));




app.listen(app.get('port'), ()=> console.log(`Server running on port ${app.get('port')}`));
