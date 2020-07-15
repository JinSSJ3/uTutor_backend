const express = require('express');
const router = express.Router();

router.use(express.json());
const tutoriaController = require('../controllers/procesoTutoriaController');


router.get("/",(req, res)=>{
    res.end(`express running on the server ${app.get("port")}`);
})
router.get("/api/tutoria", tutoriaController.listar);

router.get("/api/tutoria/lista/:id", tutoriaController.listarPorPrograma);

router.get("/api/tutoria/lista/:idTutor/:idPrograma", tutoriaController.listarPorProgramaYTutor);

router.post("/api/tutoria", tutoriaController.registrar);

router.post("/api/tutoria/modificar", tutoriaController.modificar);

router.post("/api/tutoria/eliminar/:id", tutoriaController.eliminar);

router.get("/api/tutoria/:id", tutoriaController.get);

router.get("/api/tutoriafija/:idPrograma", tutoriaController.listarTutoriasFijasPorPrograma);

router.get("/api/tutoriavariable/:idPrograma", tutoriaController.listarTutoriasVariablesPorPrograma);

router.get("/api/tutoriaasignada/:idPrograma/:idAlumno", tutoriaController.listarTutoriasFijasAsignadasAPorAlumno);

router.get("/api/tutoriagrupal/:idPrograma", tutoriaController.listarTutoriasGrupalesPorPrograma);

router.get("/api/tutoriafijasolicitada/:idPrograma", tutoriaController.listarTutoriasFijasYSolicitadasPorPrograma);

router.get("/api/tutoriafijaasignada/:idPrograma", tutoriaController.listarTutoriasFijasYAsignadasPorPrograma);




module.exports = router;