const express = require('express');
const morgan = require('morgan');
const router = express.Router();

router.use(express.json());
const institucionController = require('../controllers/institucionController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/institucion", institucionController.listar);

router.post("/api/institucion", institucionController.registrar);

router.post("/api/institucion/modificar", institucionController.modificar);

module.exports = router;