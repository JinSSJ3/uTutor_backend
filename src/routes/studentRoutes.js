const express = require('express');
const morgan = require('morgan');
const router = express.Router();

router.use(express.json());
const studentController = require('../controllers/studentController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/student", studentController.list);

router.post("/api/student", studentController.register);

app.use(morgan('dev'));


module.exports = router;