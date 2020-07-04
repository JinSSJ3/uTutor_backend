const express = require('express');
const router = express.Router();

router.use(express.json());
const areaApoyoController = require('../controllers/areaApoyoController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/areaApoyo", areaApoyoController.listar);

router.post("/api/areaApoyo", areaApoyoController.registrar);

router.post("/api/areaApoyo/modificar", areaApoyoController.modificar);

module.exports = router;