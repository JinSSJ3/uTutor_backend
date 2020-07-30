export const rutasSSJ= [
  //ORIGEN
  "/",

  //PRINCIPALES
  "/administrador/",
  "/coordinador/",
  "/tutor/",
  "/alumno/",
  
  // ADMIN
  "/administrador/perfil",
  "/administrador/institucion",
  "/administrador/facultades",
  "/administrador/coordinadores",
  "/administrador/unidadesdeapoyo",
  
  //COORDINADOR
  "/coordinador/perfil",
  "/coordinador/facultades",
  "/coordinador/tutores",
  "/coordinador/alumnos",
  "/coordinador/asignaciondeTutor",
  "/coordinador/procesosdetutoria",
  "/coordinador/programas",
  "/coordinador/disponibilidades",
  "/coordinador/coordinadoresdeprograma",
  "/coordinador/reportes",
  "/coordinador/asignarroles",
  "/coordinador/alumno/:idAlumno/:fullname",
  
  // TUTOR
  "/tutor/perfil",
  "/tutor/misalumnos",
  "/tutor/midisponibilidad",
  "/tutor/sesiones",
  "/tutor/solicitudes",
  "/tutor/sesionesgrupales",
  "/tutor/misCitas",
  "/tutor/mialumno/:idAlumno/:fullname",
  
  // ALUMNO
  "/alumno/solicitarTutorFijo",
  "/alumno/perfil",
  "/alumno/agendarCita",
  "/alumno/misCitas",
];