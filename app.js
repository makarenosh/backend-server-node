//Require
var express = require('express');
var mongoose = require('mongoose');

//init vars
var app = express();

//DB conection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, res)=>{
    if(error)
        throw error;
        console.log('conectado a la DB hospitalDB en mongoDB');
});

//rutas
app.get( '/', (req, res, next)=>{
    res.status(200).json({
        success: true,
        message: 'Petición realizada correctamente'
    });
});

//escuchar peticiones
app.listen(3000, ()=>{
    console.log('Servidor Node/Express corriendo en puerto 3000: \x1b[36m%s\x1b[0m', 'online');
});