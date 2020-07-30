const express = require('express');
const router = express.Router();
const path = require("path");

router.use(express.json());

//////////////////////////////////////////////////////////////////////
const ututor_net = path.join(__dirname,"..",process.env.UTUTOR_NET_EC2_LOCATION);
const ututor_net_404 = path.join(__dirname, "..","404", "index.html");
//ututor.net
router.get("/", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/administrador/", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/coordinador/", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/tutor/", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/alumno/", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});

//ADMIN
router.get("/administrador/perfil", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/administrador/institucion", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/administrador/facultades", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/administrador/coordinadores", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/administrador/unidadesdeapoyo", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});

//COORDINADOR
router.get("/coordinador/perfil", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/coordinador/facultades", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/coordinador/tutores", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/coordinador/alumnos", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/coordinador/asignaciondeTutor", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/coordinador/procesosdetutoria", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/coordinador/programas", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/coordinador/disponibilidades", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/coordinador/coordinadoresdeprograma", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/coordinador/reportes", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/coordinador/asignarroles", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/coordinador/alumno/:idAlumno/:fullname", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});

//TUTOR
router.get("/tutor/perfil", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/tutor/misalumnos", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/tutor/midisponibilidad", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/tutor/sesiones", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/tutor/solicitudes", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/tutor/sesionesgrupales", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/tutor/misCitas", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/tutor/mialumno/:idAlumno/:fullname", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});

//ALUMNO
router.get("/alumno/solicitarTutorFijo", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/alumno/perfil", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/alumno/agendarCita", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});
router.get("/alumno/misCitas", function (req, res) {
  try {
    res.sendFile(path.join(ututor_net, "index.html"));
  } catch (error) {
    res.status(404).sendFile(ututor_net_404);
  }
});

module.exports = router;

export const rutas= [
  "/administrador/perfil",
  "/administrador/facultades",
  "/administrador/coordinadores"
];