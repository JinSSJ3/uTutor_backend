const express = require('express');
const router = express.Router();

router.use(express.json());
const coordinadorController = require('../controllers/coordinadorController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/coordinador", coordinadorController.listarCoordinadoresFacultad);

router.get("/api/coordinadorprograma/:idFacultad", coordinadorController.listarCoordinadoresPrograma);

router.get("/api/coordinador/lista/:id", coordinadorController.listarPorPrograma);

router.get("/api/coordinador/:id", coordinadorController.get);

router.get("/api/coordinador/buscar/:codigo", coordinadorController.buscarPorCodigo);

router.post("/api/coordinador", coordinadorController.registrarCoordinadorPrograma);

router.post("/api/coordinadorfacultad", coordinadorController.registrarCoordinadorFacultad);

router.post("/api/coordinador/modificar", coordinadorController.modificarCoordinadorPrograma);

router.post("/api/coordinadorfacultad/modificar", coordinadorController.modificarCoordinadorFacultad);

router.post("/api/coordinador/eliminar/:id", coordinadorController.eliminarCoordinadorPrograma);

router.post("/api/coordinadorfacultad/eliminar/:id", coordinadorController.eliminarCoordinadorPrograma);


module.exports = router;