const controllers = {}

const path = require('path');

controllers.logDeAuditoria = async (req, res) => {  //registros de auditoria
    const {usuario, transaccion} = req.body.auditoria;
    try{
        let fso, f, r;
        let ForReading = 1, ForWriting = 2;
        let dia=new Date();
        fso = new ActiveXObject("Scripting.FileSystemObject"); 
        f = fso.OpenTextFile(path.join("..","Auditoria","Auditoria"+dia.getDay()+"-"+dia.getMonth()+"-"+dia.getFullYear()+"-"+".txt", ForWriting, true));
        f.Write(usuario+"   "+transaccion);
        f.Close();       
    }    
    catch (error) {
        res.json({error: error.message});    
    }
};





module.exports = controllers;