'use strict'
var express = require('express');
var api = express.Router();
var md_auth = require('../middlewares/jwt');

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

// ========================
//  Obtener resultados de una colección
// ========================
api.get('/collection/:table/:search', (req, res)=>{
    var table = req.params.table;
    var search = req.params.search;
    var regEx = new RegExp(search, 'i');
    var promesa;
    switch (table) {
        case 'doctor':
                promesa = searchDoctors(search, regEx);
            break;
            case 'hospital':
                promesa = searchHospitals(search, regEx);
            case 'user':
                promesa = searchUsers(search, regEx);
            break;
    
        default:
            return res.status(400).json({ success: false, message: 'Los tipos de búsqueda son user hospital y doctor'})
            break;
    }

    promesa.then(
        data => {
            res.status(200).json( { [table]: data} );
        }
    );
});

// ========================
//  Obtener resultados
// ========================
api.get('/all/:search', (req, res)=>{
        var search = req.params.search;
        var regEx = new RegExp(search, 'i');

        Promise.all([
                searchHospitals(search, regEx), 
                searchDoctors(search, regEx),
                searchUsers(search, regEx)
        ])
        .then(respuestas =>{
            res.status(200).send({hospitals: respuestas[0],doctors: respuestas[1], users: respuestas[2], success: true});
        }
        );      
    
});

function searchHospitals(search, expreg){
    return new Promise((resolve, reject) =>{
        Hospital.find({name: expreg})
        .populate('user', 'name email')
        .exec( (err, hospitals)=>{
            if(err){
                 reject('Error buscando hospitales');                
            }else{
                resolve(hospitals);
            }
        });
    });
}

function searchDoctors(search, expreg){
    return new Promise((resolve, reject) =>{
        Doctor.find({name: expreg})
        .populate('user', 'name email')
        .populate('hospital')
        .exec( (err, doctors)=>{
            if(err){                
                 reject('ERROR buscando doctores');
            }else{
                resolve(doctors);
            }
        });
    });
}

function searchUsers(search, expreg){
    return new Promise((resolve, reject) =>{
        User.find({}, 'name email role')
        .or( {'name': expreg, 'email': expreg}).exec( (err, users)=>{
            if(err){                
                 reject('ERROR buscando usuarios');
            }else{
                resolve(users);
            }
        });
    });
}
module.exports = api;


