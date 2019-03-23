var CONFIG = require('../config/config');
var jwt = require('jsonwebtoken');


exports.ensureAuth = (req, res, next)=>{
    var token = req.query.token;
    jwt.verify(token, CONFIG.SEED, (err, decoded)=>{
        if(err)
            return res.status(401).send({message: 'Token incorrecto', error: err, success: false});
        else{
            req.user = decoded.user;
            next();
                
        }
            
    });
};