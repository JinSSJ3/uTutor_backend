const express = require('express');
const router = express.Router();

router.use(express.json());
const buzonSugerenciasController = require('../controllers/buzonSugerenciasController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/sugerencia", buzonSugerenciasController.listar);

router.post("/api/sugerencia", buzonSugerenciasController.registrar);

module.exports = router;