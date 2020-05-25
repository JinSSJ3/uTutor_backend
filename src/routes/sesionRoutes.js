const express = require('express');
const morgan = require('morgan');
const router = express.Router();

router.use(express.json());
const sesionController = require('../controllers/sesionController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/listaSesiones/:idtutor", sesionController.listar);

router.post("/api/registrarSesion", sesionController.registrarSesionInesperada);

router.post("/api/registrarCita", sesionController.registrarCita);

router.post("/api/registrarResultadoCita", sesionController.registrarAsistencia);

router.get("/api/sesion/:idSesion", sesionController.get);

router.post("/api/registrarInasistencia", sesionController.registrarInasistencia);

app.use(morgan('dev'));


module.exports = router;