'use strict'

var express = require('express');
var Doctor = require('../models/doctor');

var api = express.Router();
var md_auth = require('../middlewares/jwt');


// ========================
//  Obtener doctors
// ========================
api.get('/', (req, res)=>{
    var from = req.query.from || 0;
    from = Number(from);
    var resulsPerPage = 5;
    Doctor.find({

    })
    .populate('user', 'name email img')
    .populate('hospital')
    .skip(from)
    .limit(resulsPerPage)
    .exec(
    (err, doctors)=>{
        if(err){
            res.status(500).send({message: 'Error en el servidor', success: false});
            return;
        }
        else{
            if(doctors)
            {
                Doctor.count({}, (err, totalDoctors)=>{
                    res.status(200).send({doctors, success: true, total: totalDoctors});
                });
            }
                
        }
        
    });  
});

// ========================
//  Añadir doctors
// ========================
api.post('/', md_auth.ensureAuth, md_auth.ensureAuth, (req, res)=>{
    var body = req.body;
    var doctor = new Doctor({
        name: body.name,
        user: req.user._id,
        hospital: body.hospital
    });

    doctor.save((err, savedDoctor)=>{
        if(err){
            res.status(400).send({message: 'Error al crear el nuevo doctor en el servidor', error: err, success: false});
            return;
        }
        else{
            if(savedDoctor)
                res.status(201).send({savedDoctor, success: true});
        }
    });
    

});

// ========================
//  Actualizar doctor
// ========================
api.put('/:id',md_auth.ensureAuth, (req, res)=>{
    var id = req.params.id;
    var body = req.body;
    Doctor.findById(id, (err, doctor)=>{
        if(err){
            res.status(500).send({message: 'Error al actualizar el doctor en el servidor', error: err, success: false});
            return;
        }
        else{
            if(doctor){
                doctor.name = body.name;
                doctor.user = req.user._id;
                doctor.hospital = body.hospital;
                
                doctor.save( (err, doctor)=>{
                    if(err){
                        res.status(400).send({message: 'Error al actualizar el doctor en el servidor', error: err, success: false});
                        return;
                    }
                    else{                        
                        if(doctor)
                            res.status(201).send({doctor, success: true});
                    }
                });                
            }                
            else{
                res.status(400).send({message: 'Error al actualizar el doctor en el servidor', error: err, success: false});
                return;
            }
        }
    });   
});

// ========================
//  Eliminar doctor
// ========================

api.delete('/:id', md_auth.ensureAuth, (req, res)=>{
    var id = req.params.id;    
    Doctor.findOneAndRemove({ _id: id },(err, deletedDoctor) =>{
        if(err)
            res.status(500).send({success:false, message: err});
        else{
            if(deletedDoctor)
                res.status(200).send({success: true, doctor: deletedDoctor});
            else    
                console.log('NO EXISTE ESE USUARIO');
        }
    });
});

module.exports = api;