const express = require('express');
const morgan = require('morgan');
const router = express.Router();

router.use(express.json());
const programaController = require('../controllers/programaController');

router.get("/", (req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})

router.get("/api/programa", programaController.listar);

router.get("/api/programa&facultad", programaController.listarProgramasYFacultades);

router.get("/api/facultad/coordinador/:idCoordinador", programaController.listarFacultadesDeUnCoordinador);

router.get("/api/facultad", programaController.listarFacultad);

router.get("/api/programa/lista/:id", programaController.listarPorFacultad);

router.get("/api/programa&facultad/coordinador/:id", programaController.listarProgramasYFacultadesPorCoordinador);

router.get("/api/programa/coordinador/:id", programaController.listarProgramasPorCoordinadorConFormato);

router.post("/api/facultad", programaController.registrarFacultad);

router.post("/api/programa", programaController.registrarPrograma);

router.post("/api/programa/modificar", programaController.modificarPrograma);

router.post("/api/facultad/modificar", programaController.modificarFacultad);



module.exports = router;