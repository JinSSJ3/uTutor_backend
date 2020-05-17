const express = require('express');
const morgan = require('morgan');
const router = express.Router();

router.use(express.json());
const usuarioController = require('../controllers/usuarioController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/usuario", usuarioController.list);

router.post("/api/usuario", usuarioController.register);

router.get("/api/usuario/:id", usuarioController.get);

app.use(morgan('dev'));


module.exports = router;