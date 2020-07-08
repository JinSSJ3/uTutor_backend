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

router.post("/api/registrarResultadoCita", sesionController.registrarResultados);

router.get("/api/sesion/:idSesion", sesionController.get);

router.post("/api/posponerCita", sesionController.posponerCita);

router.post("/api/cancelarCita", sesionController.cancelarCita);

router.get("/api/listaSesiones/:idtutor/:fecha", sesionController.listarPorFecha);

router.get("/api/listaCompromisos/:idsesion", sesionController.listarCompromisos);

router.get("/api/listaSesionAlumnoProcesoTutoria/:idAlumno/:idProcesoTutoria", sesionController.listarSesionesPorAlumnoYProcesoTutoria);

router.get("/api/listaCompromisosAlumnoProcesoTutoria/:idAlumno/:idProcesoTutoria", sesionController.listarCompromisosPorAlumnoYProcesoTutoria);

router.get("/api/listaAreasApoyo/", sesionController.listarAreasApoyo);

router.get("/api/listaSesionAlumno/:idalumno", sesionController.listarPorAlumno);

router.get("/api/listaSesionRealizada/:idalumno", sesionController.listarPorAlumnoRealizadas);

router.post("/api/compromiso/modificar", sesionController.modificarCompromiso);

router.get("/api/sesion/motivosolicitud/:idPrograma", sesionController.listarMotivosSolicitud);

router.get("/api/sesion/horastutoria/:idPrograma", sesionController.listarTiempoTutoriasAcumulada);

module.exports = router;