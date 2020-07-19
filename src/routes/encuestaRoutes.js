const express = require('express');
const router = express.Router();

router.use(express.json());
const encuestaController = require('../controllers/encuestaController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/encuesta/tutoria/:idPrograma", encuestaController.listarPorTutoria);

router.get("/api/encuesta/:id", encuestaController.get);

router.post("/api/encuesta", encuestaController.registrar);

router.get("/api/encuesta/programa/:idPrograma", encuestaController.listarPorPrograma);




module.exports = router;