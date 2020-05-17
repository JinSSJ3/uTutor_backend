const express = require('express');
const morgan = require('morgan');
const router = express.Router();

router.use(express.json());
const studentController = require('../controllers/alumnoController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/student", studentController.list);

router.post("/api/student", studentController.register);

router.get("/api/student/:id", studentController.get);

app.use(morgan('dev'));


module.exports = router;