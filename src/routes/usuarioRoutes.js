const express = require('express');
const router = express.Router();

router.use(express.json());
const usuarioController = require('../controllers/usuarioController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/usuario/:correo", usuarioController.buscarPorCorreo);

router.get("/api/usuario/buscar/:codigo", usuarioController.buscarPorCodigo);

router.get("/api/usuario/validar/:usuario", usuarioController.validarUsuarioUnico);

router.post("/api/usuario/login", usuarioController.login);

router.post("/api/usuario/actualizarperfil", usuarioController.modificarPerfil);


module.exports = router;