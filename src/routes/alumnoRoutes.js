const express = require('express');
const morgan = require('morgan');
const router = express.Router();

router.use(express.json());
const alumnoController = require('../controllers/alumnoController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/alumno", alumnoController.list);

router.post("/api/alumno", alumnoController.register);

router.get("/api/alumno/:id", alumnoController.get);

app.use(morgan('dev'));


module.exports = router;