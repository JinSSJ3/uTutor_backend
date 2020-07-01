const express = require('express');
const router = express.Router();


router.use(express.json());
const asignacionTutoriaController = require('../controllers/asignacionTutoriaController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})

router.get("/api/asignacion/lista", asignacionTutoriaController.listarPorTutoria);

router.get("/api/asignacion", asignacionTutoriaController.lista);

router.get("/api/solicitud/:idTutor/:idTutoria", asignacionTutoriaController.listarSolicitudesXTutor);

router.post("/api/solicitud/modificar", asignacionTutoriaController.responderSolicitud);

router.post("/api/solicitud/enviar", asignacionTutoriaController.mandarSolicitudTutoria);

router.get("/api/asignacion/:id", asignacionTutoriaController.get);

router.post("/api/asignacion", asignacionTutoriaController.registrar);

// router.post("/api/asignacion/modificar", asignacionTutoriaController.modificar);

router.post("/api/asignacion/eliminar/:id", asignacionTutoriaController.eliminar);

module.exports = router;