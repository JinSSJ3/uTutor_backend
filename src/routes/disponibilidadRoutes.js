const express = require('express');
const morgan = require('morgan');
const router = express.Router();

router.use(express.json());
const disponibilidadController = require('../controllers/disponibilidadController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/disponibilidad/:idtutor", disponibilidadController.list);

router.post("/api/disponibilidad", disponibilidadController.register);

router.get("/api/disponibilidad/:idtutor/:id", disponibilidadController.get);

router.post("/api/disponibilidad/modificar", disponibilidadController.modificar);

router.post("/api/disponibilidad/eliminar/:idDisp", disponibilidadController.eliminar);




module.exports = router;