const express = require('express');
const morgan = require('morgan');
const router = express.Router();

router.use(express.json());
const tutoriaController = require('../controllers/procesoTutoriaController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/tutoria", tutoriaController.listar);

router.get("/api/tutoria/lista/:id", tutoriaController.listarPorPrograma);

router.post("/api/tutoria", tutoriaController.registrar);

router.get("/api/tutoria/:id", tutoriaController.get);

app.use(morgan('dev'));


module.exports = router;