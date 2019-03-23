'use strict'

var express = require('express');
const bcrypt = require('bcrypt');
var User = require('../models/user');

var api = express.Router();
var md_auth = require('../middlewares/jwt');


// ========================
//  Obtener usuarios
// ========================
api.get('/', (req, res)=>{

    var from = req.query.from || 0;
    from = Number(from);
    var resulsPerPage = 5;
    User.find({

    },'name email image role',)
    .skip(from)
    .limit(resulsPerPage)
    .exec((err, users)=>{
        if(err){
            res.status(500).send({message: 'Error en el servidor', success: false});
            return;
        }
        else{
            if(users)
               {
                    User.count({}, (err, totalUsers)=>{
                        res.status(200).send({users, success: true, total: totalUsers});
                    });                    
                }
        }
        
    });  
});

// ========================
//  Añadir usuarios
// ========================
api.post('/', md_auth.ensureAuth, md_auth.ensureAuth, (req, res)=>{
    var body = req.body;
    var user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        image: body.img || 'null',
        role: body.role
    });

    user.save((err, savedUser)=>{
        if(err){
            res.status(400).send({message: 'Error al crear el nuevo usuario en el servidor', error: err, success: false});
            return;
        }
        else{
            if(savedUser)
                res.status(201).send({savedUser, success: true});
        }
    });
    

});

// ========================
//  Actualizar usuario
// ========================
api.put('/:id',md_auth.ensureAuth, (req, res)=>{
    var id = req.params.id;
    var body = req.body;
    User.findById(id, (err, user)=>{
        if(err){
            res.status(500).send({message: 'Error al actualizar el usuario en el servidor', error: err, success: false});
            return;
        }
        else{
            if(user){
                user.name = body.name;
                user.email = body.email;
                user.role = body.role;
                user.save( (err, user)=>{
                    if(err){
                        res.status(400).send({message: 'Error al actualizar el usuario en el servidor', error: err, success: false});
                        return;
                    }
                    else{
                        user.password = ':)';
                        if(user)
                            res.status(201).send({user, success: true});
                    }
                });                
            }                
            else{
                res.status(400).send({message: 'Error al actualizar el usuario en el servidor', error: err, success: false});
                return;
            }
        }
    });   
});

// ========================
//  Eliminar usuario
// ========================

api.delete('/:id', md_auth.ensureAuth, (req, res)=>{
    var id = req.params.id;    
    User.findOneAndRemove({ _id: id },(err, deletedUser) =>{
        if(err)
            res.status(500).send({success:false, message: err});
        else{
            if(deletedUser)
                res.status(200).send({success: true, user: deletedUser});
            else    
                console.log('NO EXISTE ESE USUARIO');
        }
    });
});

module.exports = api;