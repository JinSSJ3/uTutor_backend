const controllers = {}

let sequelize = require('../models/database');
let institucion = require('../models/institucion');

controllers.listar = async (req, res) => { 
    try{
        const inst = await institucion.findOne();
        res.status(201).json({institucion:inst});         
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};


/**
 * @returns La nueva institucion creada en formato Json()
 * HTTP status code 201 significa que se creo exitosamente
 */
controllers.registrar = async (req, res) => {  
    /**
     * Aqui deberia haber una validacion (un middleware) para validar
     * que se envio una "tutoria" en el cuerpo ("body") del request ("req")
     *  */ 
    const transaccion = await sequelize.transaction();
    const {NOMBRE, INICIALES, IMAGEN, TELEFONO, PAGINA_WEB, UBICACION, DOMINIO, FACEBOOK, TWITTER, YOUTUBE} = req.body.institucion; 
  //  console.log("GOT: ", PROGRAMA);//solo para asegurarme de que el objeto llego al backend
    try {
        const nuevaInstitucion = await institucion.create({
            NOMBRE: NOMBRE,
            INICIALES: INICIALES,
            IMAGEN: IMAGEN,
            TELEFONO: TELEFONO,
            PAGINA_WEB: PAGINA_WEB,
            UBICACION: UBICACION,
            DOMINIO: DOMINIO,
            FACEBOOK: FACEBOOK,
            TWITTER: TWITTER,
            YOUTUBE: YOUTUBE
        }, {transaction: transaccion})

        await transaccion.commit();
        res.status(201).json({institucion: nuevaInstitucion}); 
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};


controllers.modificar = async (req, res) => {  
    
    const transaccion = await sequelize.transaction();
    const {ID, NOMBRE, INICIALES, IMAGEN, TELEFONO, PAGINA_WEB, UBICACION, DOMINIO, FACEBOOK, TWITTER, YOUTUBE} = req.body.institucion;
    try {
        const institucionModificada = await institucion.update({
            NOMBRE: NOMBRE,
            INICIALES: INICIALES,
            IMAGEN: IMAGEN,
            TELEFONO: TELEFONO,
            PAGINA_WEB: PAGINA_WEB,
            UBICACION: UBICACION,
            DOMINIO: DOMINIO,
            FACEBOOK: FACEBOOK,
            TWITTER: TWITTER,
            YOUTUBE: YOUTUBE
        }, {
            where: {ID_INSTITUCION: ID}
        }, {transaction: transaccion})

        await transaccion.commit();
        res.status(201).json({institucion: req.body.institucion});
    }catch (error) {
        await transaccion.rollback();
        res.json({error: error.message})
    }
    
};

module.exports = controllers;