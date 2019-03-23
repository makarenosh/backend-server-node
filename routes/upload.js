'use strict'
var express = require('express');
var api = express.Router();
var app = express();
var fileUpload = require('express-fileupload');
var fs = require('fs');
var md_auth = require('../middlewares/jwt');

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

const path = require('path');

app.use(fileUpload());

// ========================
//  Subir imagen
// ========================
api.put('/:type/:id', (req, res, next)=>{

    var type = req.params.type;
    var id = req.params.id;

    var validCollections = [ 'hospitals', 'users','doctors'];
    if(validCollections.indexOf(type) < 0){
        return res.status(400).json({
            success: false,
            message: 'Tipo de colección no válida'
        });
    }
    
    if(!req.files){
        return res.status(400).json({
            success: false,
            message: 'no hay ficheros adjuntos para subir'
        });
    }

    //obtener nombre del archivo
    var archivo = req.files.img;
    var cutName = archivo.name.split('.');  
    var lastPos = cutName.length -1;  
    var fileExt = cutName[lastPos];    

    //Solo extensiones
    var validExtensions = [ 'png', 'jpg', 'gif', 'jpeg'];

    if(validExtensions.indexOf(fileExt) < 0 ){
        return res.status(400).json({
            success: false,
            message: 'Extensión del archivo no válida.. (jpg, jpeg, gif, png)'
        });
    }

    //crear nombre de archivo
    var newFileName = `${ id }-${new Date().getMilliseconds()}.${fileExt}`;    

    //Mover archivo al path especifico para imgs
    var path = `./upload/${type}/${newFileName}`;    
    archivo.mv(path, err=>{
        if(err){
            return res.status(500).json({
                success: false,
                message: 'Error al guardar el archivo en la carpeta' + type + ' del servidor'
            });
        }else{            
            uploadByType(type, id, newFileName, res);
        }
    });
    
});

function uploadByType(collection, id, newFileName, res){

    if(collection == 'users'){
        User.findById(id, (err, user)=>{
            if(err)
                res.status(500).json({message:'error al actualizar imagen de usuario'});

            var oldPath = './upload/users/' + user.image;
            //si existe una imagen anterior la elimino
            if(fs.existsSync(oldPath)){
                fs.unlink(oldPath);
            }

            user.image = newFileName;
            user.save( (err, updatedUser)=>{
                if(err)
                    return res.status(500).json({message:'error al actualizar imagen de usuario'});
                    if(!updatedUser){
                        return res.status(400).json({
                            success: false,                
                            message: 'No se actualizó el usuario',                            
                        });
                    }
                    updatedUser.password = ':)';
                    return res.status(200).json({
                        success: true,                
                        message: 'Imagen de usuario actualizada',
                        user: updatedUser
                    });
            });
        });
    }

    if(collection == 'hospitals'){
        Hospital.findById(id, (err, hospital)=>{
            if(err)
                res.status(500).json({message:'error al actualizar imagen de hospital'});

            var oldPath = './upload/hospitals/' + hospital.img;
            //si existe una imagen anterior la elimino
            if(fs.existsSync(oldPath)){
                fs.unlink(oldPath);
            }

            hospital.img = newFileName;
            hospital.save( (err, updatedHospital)=>{
                if(err)
                    return res.status(500).json({message:'error al actualizar imagen de hospital'});

                    if(!updatedHospital){
                        return res.status(400).json({
                            success: false,                
                            message: 'No se actualizó el hospital',                            
                        });
                    }
                    return res.status(200).json({
                        success: true,                
                        message: 'Imagen de hospital actualizada',
                        hospital: updatedHospital
                    });

            });
        });
    }

    if(collection == 'doctors'){
        Doctor.findById(id, (err, doctor)=>{
            if(err)
                res.status(500).json({message:'error al actualizar imagen de doctor'});

            var oldPath = './upload/doctors/' + doctor.img;
            //si existe una imagen anterior la elimino
            if(fs.existsSync(oldPath)){
                fs.unlink(oldPath);
            }

            doctor.img = newFileName;
            doctor.save( (err, updatedDoctor)=>{
                if(err)
                    return res.status(500).json({message:'error al actualizar imagen de doctor'});

                    if(!updatedDoctor){
                        return res.status(400).json({
                            success: false,                
                            message: 'No se actualizó el doctor',                            
                        });
                    }
                    return res.status(200).json({
                        success: true,                
                        message: 'Imagen de doctor actualizada',
                        user: updatedUser
                    });

            });
        });
    }

    
}

// ========================
//  Get imagen
// ========================
api.get('/:type/:image', (req, res)=>{
    var type = req.params.type;
    var image = req.params.image;

    var pathImage = path.resolve( __dirname, `../upload/${type}/${image}` );

    if(fs.existsSync(pathImage)){
        res.sendFile( pathImage );
    }else{
        var pathNoImage = path.resolve( __dirname, '../assets/no-image.png');
        res.sendFile(pathNoImage);
    }

});

module.exports = api;