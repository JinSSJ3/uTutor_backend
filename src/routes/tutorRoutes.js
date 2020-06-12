const express = require('express');
const morgan = require('morgan');
const router = express.Router();

router.use(express.json());
const tutorController = require('../controllers/tutorController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/tutor", tutorController.list);

router.get("/api/tutor/lista/:idPrograma", tutorController.listarPorPrograma);

router.post("/api/tutor", tutorController.register);

router.get("/api/tutor/:id", tutorController.get);

router.post("/api/tutor/modificar", tutorController.modificar);



module.exports = router;