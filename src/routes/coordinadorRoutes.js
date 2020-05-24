const express = require('express');
const router = express.Router();

router.use(express.json());
const coordinadorController = require('../controllers/coordinadorController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/coordinador", coordinadorController.listar);

router.get("/api/coordinador/lista/:id", coordinadorController.listarPorPrograma);

router.get("/api/coordinador/:id", coordinadorController.get);

router.get("/api/coordinador/buscar/:codigo", coordinadorController.buscarPorCodigo);

router.post("/api/coordinador", coordinadorController.registrar);

router.post("/api/coordinador/modificar", coordinadorController.modificar);

router.post("/api/coordinador/eliminar/:id", coordinadorController.eliminar);


module.exports = router;