'use strict'

var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var User = require('./models/user');
const CONFIG = require('./config/config');


var api = express.Router();

api.post('/', (req, res)=>{
    var body = req.body;

    User.findOne({
        email : body.email
    }, (err, user)=>{
        if(err){
            res.status(400).json({message: 'Error al buscar el usuario', success: false});
            return;
        }
        else{
            if(user)
                {
                    if(bcrypt.compareSync(body.password, user.password))
                        {
                            //create token
                            user.password = ':)';
                            var token = jwt.sign({user: user}, CONFIG.SEED, {expiresIn: 14400});//4horas
                            res.status(200).json({user, token: token, success: true});
                        }
                    else
                        res.status(400).json({message: 'password incorrecto', success: false});
                }
            else
                res.status(400).json({message: 'Credenciales incorrectas', success: false});
        }
    });
   
});

module.exports = api;