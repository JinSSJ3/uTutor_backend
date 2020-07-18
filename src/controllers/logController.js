const controllers = {}

const path = require('path');
const fsPath =  require('fs-path');

controllers.logDeAuditoria = async (req, res) => {  //registros de auditoria
    const {usuario, transaccion} = req.body.auditoria;
    try{
        let dia=new Date();
        let ruta = await path.join("..","Auditoria","Auditoria"+dia.getDay()+"-"+dia.getMonth()+"-"+dia.getFullYear()+".txt");
        let data = await usuario + "-" + transaccion;
        fsPath.writeFile(ruta, data, function (err) {
            if (err) {
                return console.log(err);
            }
        }) 
        res.status(201).json({estado: "Registro exitoso"});       
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};


module.exports = controllers;