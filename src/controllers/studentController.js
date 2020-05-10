const controllers = {}

let sequelize = require('../models/database');
let student = require('../models/student');

controllers.insert = async (req, res) =>{    
    const response = await sequelize.sync().then(function(){
        usuario.create({
            user: 'luis12',
            password: 'sfsdf56',
            name: 'Luis'
        })
         
    })
    .catch(error =>{
        return error;
    });
    

    res.json(response);
    
}

controllers.list = async (req, res) => {    
    const students = await student.findAll();
    res.json({students});     
    
};
    
    
    


module.exports = controllers;