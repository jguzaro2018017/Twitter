'use strict'

var mongoose = require('mongoose');
var port = 3800;
var app = require('./app');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/TwitterB', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log('Conexion a la BD Correcta');
        app.listen(port, ()=>{
            console.log('Servidor a express corriendo', port);
            console.log('La ruta para utilizar el programa es: http://localhost:3800/twitter/commands');
        });
    }).catch(err =>{
        console.log('Error al conectarse al servidor', err);
    })