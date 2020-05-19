const express = require('express');
const morgan = require('morgan');
const router = express.Router();

router.use(express.json());
const coordinadorController = require('../controllers/coordinadorController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/coordinador", coordinadorController.listar);

//router.get("/api/coordinador/lista/:id", coordinadorController.listarPorPrograma);

router.post("/api/coordinador", coordinadorController.registrar);

router.get("/api/coordinador/:id", coordinadorController.get);

app.use(morgan('dev'));


module.exports = router;