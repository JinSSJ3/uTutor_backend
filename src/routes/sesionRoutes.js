const express = require('express');
const morgan = require('morgan');
const router = express.Router();

router.use(express.json());
const sesionController = require('../controllers/sesionController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/sesion/:idtutor", sesionController.list);

router.post("/api/sesion", sesionController.registerUnexpectedSession);

router.get("/api/sesion/:id", sesionController.get);

app.use(morgan('dev'));


module.exports = router;