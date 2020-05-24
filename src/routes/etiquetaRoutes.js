const express = require('express');
const router = express.Router();

router.use(express.json());
const etiquetaController = require('../controllers/etiquetaController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/etiqueta", etiquetaController.listar);

router.post("/api/etiqueta", etiquetaController.registrar);

router.post("/api/etiqueta/modificar", etiquetaController.modificar);

router.post("/api/etiqueta/eliminar/:id", etiquetaController.eliminar);

router.get("/api/etiqueta/:id", etiquetaController.get);


module.exports = router;