'use strict'
var express = require('express');
var Hospital = require('../models/hospital');

var api = express.Router();
var md_auth = require('../middlewares/jwt');


// ========================
//  Obtener hospitals
// ========================
api.get('/', (req, res)=>{
    var from = req.query.from || 0;
    from = Number(from);
    var resulsPerPage = 5;
    Hospital.find({

    }).populate('user','name email img')
    .skip(from)
    .limit(resulsPerPage)
    .exec(
    (err, hospitals)=>{
        if(err){
            res.status(500).send({message: 'Error en el servidor', success: false});
            return;
        }
        else{
            if(hospitals){
                Hospital.count({}, (err, totalHospitals)=>{
                    res.status(200).send({hospitals, success: true, total: totalHospitals});
                })
            }
                
        }
        
    });  
});

api.get('/:id', (req, res)=>{
    var id = req.params.id;    
    Hospital.findById(id, (err, hospital)=>{
        if(err){
            res.status(500).send({message: 'Error al obtener el hospital en el servidor', error: err, success: false});
            return;
        }
        if(hospital)
            res.status(200).send({hospital, success: true});
    } );
});

// ========================
//  Añadir hospitals
// ========================
api.post('/', md_auth.ensureAuth, (req, res)=>{
    var body = req.body;
    var hospital = new Hospital({
        name: body.name,        
        user: req.user._id
    });    

    hospital.save((err, savedHospital)=>{
        if(err){
            res.status(400).send({message: 'Error al crear el nuevo hospital en el servidor', error: err, success: false});
            return;
        }
        else{
            if(savedHospital)
                res.status(201).send({hospital: savedHospital, success: true});
        }
    });
    

});

// ========================
//  Actualizar hospital
// ========================
api.put('/:id',md_auth.ensureAuth, (req, res)=>{
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital)=>{
        if(err){
            res.status(500).send({message: 'Error al actualizar el hospital en el servidor', error: err, success: false});
            return;
        }
        else{
            if(hospital){
                hospital.name = body.name;
                // hospital.img = body.img;
                hospital.user = req.user._id;
                hospital.save( (err, hospital)=>{
                    if(err){
                        res.status(400).send({message: 'Error al actualizar el hospital en el servidor', error: err, success: false});
                        return;
                    }
                    else{                        
                        if(hospital)
                            res.status(201).send({hospital, success: true});
                    }
                });                
            }                
            else{
                res.status(400).send({message: 'Error al actualizar el hospital en el servidor', error: err, success: false});
                return;
            }
        }
    });   
});

// ========================
//  Eliminar hospital
// ========================

api.delete('/:id', md_auth.ensureAuth, (req, res)=>{
    var id = req.params.id;    
    Hospital.findOneAndRemove({ _id: id },(err, deletedHospital) =>{
        if(err)
            res.status(500).send({success:false, message: err});
        else{
            if(deletedHospital)
                res.status(200).send({success: true, hospital: deletedHospital});
            else    
                console.log('NO EXISTE ESE USUARIO');
        }
    });
});

module.exports = api;