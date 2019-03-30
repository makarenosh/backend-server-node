'use strict'

var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var User = require('./models/user');
const CONFIG = require('./config/config');
const CLIENT_ID = require('./config/config').CLIENT_ID;

//google
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


var api = express.Router();

// =================
// LOGIN NORMAL
// =================
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

// =================
// LOGIN GOOGLE
// =================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
  }  

api.post('/google', async (req, res)=>{
    let token = req.body.token;
    let googleUser = await verify(token)
    .catch(err=>{
        return res.status(403).json({message: 'Token de google no válido'}); 
    });

    User.findOne({ email: googleUser.email}, (err, foundUser) =>{
        if(err)
            return res.status(500).json({success: false, message: 'error buscando el usuario de google'});

        if(foundUser){
            if(foundUser.google == false){
                return res.status(400).json({success: false, message: 'Debe de usar autenticación normal'});
            }else{
                var token = jwt.sign({user: foundUser}, CONFIG.SEED, {expiresIn: 14400});//4horas
                res.status(200).json({user: foundUser, token: token, success: true, id: foundUser._id});
            }
        }else{
            //crear usuario 
            var user = new User();
            user.name = googleUser.name;
            user.email = googleUser.email;
            user.image = googleUser.img;
            user.google = true;
            user.password = ':)';

            user.save((err, userDB) =>{
                if(err)
                    return res.status(500).json({success: false, message: 'error creando el usuario desde google'});
                else{
                    var token = jwt.sign({user: userDB}, CONFIG.SEED, {expiresIn: 14400});//4horas
                    res.status(200).json({user: userDB, token: token, success: true, success: true, message: 'Nuevo usuario de google registrado'});
                }
            });
        }

    });    
});

module.exports = api;