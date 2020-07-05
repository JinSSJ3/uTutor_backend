const express = require('express');
const router = express.Router();

router.use(express.json());
const notificacionController = require('../controllers/notificacionController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/notificacion/lista/:idUsuario", notificacionController.listar);

router.get("/api/notificacion/actualizar/:idUsuario", notificacionController.modificar);


module.exports = router;