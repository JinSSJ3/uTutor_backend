const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

/* sample draft server 
* Author: Jin Jose Manuel
* Date: 20/04/2020
**/

const app = express();

app.get('/conection', (req,res)=>{
    res("Conection established! ");
});

app.get('/api/students', (req,res)=>{
    const students = [
        {
            id: 1, name: "Jin", term:8, courses:[
                {cod: "INF245", name: "Ingenieria de Software"},
                {cod: "IND275", name: "Control de gestion industrial"},
                {cod: "INF238", name: "Redes de computadoras"}
            ]
        },
        {
            id: 2, name: "Tys", term:8, courses:[
                {cod: "INF245", name: "Ingenieria de Software"},
                {cod: "IND275", name: "Control de gestion industrial"},
                {cod: "INF238", name: "Redes de computadoras"},
                {cod: "1EST07", name: "Experimentacion numérica"},
            ]
        }
    ]
    res.json(students);
    
});

const port = Number(process.env.port);
app.listen(port, ()=> console.log(`Server runing on port ${port}`));

/** 
    Esto No es lo que se va a enregar, 
    lo hago con propositos de prueba 
    del repositorio y otras razones -->  gilazo !!
*/