const express = require('express');
const router = express.Router();

router.use(express.json());
const logController = require('../controllers/logController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/auditoria", logController.logDeAuditoria);

module.exports = router;