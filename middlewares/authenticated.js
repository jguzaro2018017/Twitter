'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'TG2482';
var User = require('../models/user.model');



exports.ensureAuthAdmin = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: 'Peticion sin autenticacion'});
    }else{
        var token = req.headers.authorization.replace(/['"]+/g, '');
        try{
            var payload = jwt.decode(token, key);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: 'Token expirado'});
            }else if(payload.role != 'ADMIN'){
                return res.status(401).send({message: 'No tienes permisos para esta ruta'});
            }
        }catch(ex){
            return res.status(404).send({message: 'Token no valido'});
        }

        req.user = payload;
        next();
    }
}   

exports.ensureAuth = (req, res, next)=>{
    var params = req.body
    var command = params.command.split(' ')[0];
    if(command){
        if(String(command.toLowerCase()) == 'login'.toLowerCase() || String(command.toLowerCase()) == 'register'.toLowerCase()){
            next();
        }else if(!req.headers.authorization){
            return res.status(403).send({message: 'Petición sin autenticación'});
        }else{
            var token = req.headers.authorization.replace(/['"]+/g, '');
            try{
                var payload = jwt.decode(token, key);
    
                if(payload.exp <= moment().unix()){
                    return res.status(401).send({message: 'Token expirado'});
                }
            }catch(ex){
                return res.status(404).send({message: 'Token no valido'})
            }
            req.user = payload;
            next();
        }
    }
}
