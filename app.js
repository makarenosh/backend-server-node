//Require
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//import routes
var app_routes = require('./routes/app');
var user_routes = require('./routes/user');
var login_routes = require('./login');

//init vars
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))


//DB conection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true }, (error, res)=>{
    if(error)
        console.log(error);
        console.log('conectado a la DB hospitalDB en mongoDB');
});

//rutas
app.use('/user', user_routes);
app.use('/login', login_routes);
app.use('/', app_routes);


//escuchar peticiones
app.listen(3000, ()=>{
    console.log('Servidor Node/Express corriendo en puerto 3000: \x1b[36m%s\x1b[0m', 'online');
});