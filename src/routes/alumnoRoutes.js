const express = require('express');
const router = express.Router();

router.use(express.json());
const alumnoController = require('../controllers/alumnoController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/alumno", alumnoController.listar);

router.get("/api/alumno/buscar/:codigo", alumnoController.buscarPorCodigo);

router.get("/api/alumno/lista/:programa", alumnoController.listarPorPrograma);

router.get("/api/alumno/lista/:tutor/:tutoria", alumnoController.listarPorTutoria);

router.post("/api/alumno", alumnoController.registrar);

router.post("/api/alumno/modificar", alumnoController.modificar);

router.post("/api/alumno/eliminar/:id", alumnoController.eliminar);

router.get("/api/alumno/:id", alumnoController.get);


module.exports = router;