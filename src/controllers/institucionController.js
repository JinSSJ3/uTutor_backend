const controllers = {}

let sequelize = require('../models/database');
let institucion = require('../models/institucion');
const fsPath =  require('fs-path');
const fs =  require('fs');
const path = require('path')


controllers.guardarImagen = async (req, res) => {
    try{
        
        fs.readFile('apple.png', function (err, data) {
            let id = 1;
            fsPath.writeFile(path.join(".","archivoImagenes",id.toString()+".png"), data, function (err) {
                // la funcion es la que maneja lo que sucede despues de termine el evento
                if (err) {
                    return console.log(err);
                }
                // las funciones de javascript en nodejs son asincronicas
                // por lo tanto lo que se quiera hacer debe hacerse dentro de la funcion que maneja el evento
                // si uno declara una variable arriba de la funcion, la manipula dentro y la quiere usar
                // despues afuera, se corre el riezgo de que nunca se realice la manipulacion.
                
                console.log(path.join(".","archivoImagenes",id.toString()+".png"));
                res.status(201).json({estado: "exito"}); 
            })
        })          
    } catch (error) {
        res.json({error: error.message});    
    }    
    
}

controllers.listar = async (req, res) => { 
    try{
        const inst = await institucion.findOne();
        if (inst.dataValues.IMAGEN){
            let cadena = inst.dataValues.IMAGEN.split(".")
            inst.dataValues.IMAGEN = fs.readFileSync(inst.dataValues.IMAGEN, "base64")
            inst.dataValues.EXTENSION = cadena[cadena.length -1]
        }              
        inst.dataValues.EXTENSION = ""
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
    const {NOMBRE, INICIALES, IMAGEN, TELEFONO, PAGINA_WEB, UBICACION, DOMINIO, EXTENSION} = req.body.institucion; 
  //  console.log("GOT: ", PROGRAMA);//solo para asegurarme de que el objeto llego al backend
    try {
        if(IMAGEN){
            fs.readFile(IMAGEN, function (err, data) {
                let ruta = path.join("..","Imagenes","Institucion","logo."+EXTENSION)
                fsPath.writeFile(ruta, data, function (err) {
                    // la funcion es la que maneja lo que sucede despues de termine el evento
                    if (err) {
                        return console.log(err);
                    }
                })
            })
        }
        const nuevaInstitucion = await institucion.create({
            NOMBRE: NOMBRE,
            INICIALES: INICIALES,
            IMAGEN: ruta,
            TELEFONO: TELEFONO,
            PAGINA_WEB: PAGINA_WEB,
            UBICACION: UBICACION,
            DOMINIO: DOMINIO
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
    const {ID, NOMBRE, INICIALES, IMAGEN, TELEFONO, PAGINA_WEB, UBICACION, DOMINIO, EXTENSION} = req.body.institucion;
    try {
        if(IMAGEN){
            fs.readFile(IMAGEN, function (err, data) {
                let ruta = path.join("..","Imagenes","Institucion","logo."+EXTENSION)
                fsPath.writeFile(ruta, data, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                })
            })
        }
        const institucionModificada = await institucion.update({
            NOMBRE: NOMBRE,
            INICIALES: INICIALES,
            IMAGEN: ruta,
            TELEFONO: TELEFONO,
            PAGINA_WEB: PAGINA_WEB,
            UBICACION: UBICACION,
            DOMINIO: DOMINIO
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