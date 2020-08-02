const controllers = {}

const path = require('path');
const fsPath =  require('fs-path');
const fs =  require('fs');

controllers.logDeAuditoria = async (req, res) => {  //registros de auditoria
    const {usuario, transaccion} = req.body.auditoria;
    try{
        let dia=new Date();
        let ruta = await path.join("..","Auditoria","Auditoria_"+dia.getDate()+"-"+dia.getMonth()+"-"+dia.getFullYear()+".txt");
        let output = ''
        // console.log(transaccion)
        if (!fs.existsSync(path.join("..","Auditoria"))) {
            fs.mkdirSync(path.join("..","Auditoria"));
        }
        for (property in transaccion) {
            output += property + ": {"
            for(prop in transaccion[property]){
                output += prop + ': ' + transaccion[property][prop]+', ';
            }
        }
        output+="}";
        let data = await usuario + output+'\n';
        
        fs.appendFile(ruta, data, function (err) {
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