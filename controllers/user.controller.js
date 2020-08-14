'use strict'

var User = require ('../models/user.model');
var Tweet = require('../models/tweet.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var moment = require('moment');

var currentDate = moment().format('MMMM Do YYYY, h:mm:ss a');

function simplify(parameter1, parameter2){
    var exist = false;
    for(var i = 0; i < parameter1.length; i++){
        if(parameter1[i] == parameter2){
            exist = true;
            i = parameter1.length
        }
    }return exist;
}

function simplifyText(param1){
    var content = ''
    for(let i = 2; i <=50; i++){
        if(param1[i] != null){
            var content = content + param1[i] + ' ';
        }else if(param1[i] == null){
            i = 50
        }
    }return content;
}


function commands(req, res){
    var params = req.body;
    var command = params.command.split(' ')[0];
    var instruction = String(command.toLowerCase());

    switch(instruction){
        case('register'):
        var user = new User();
        var params = req.body;
    
        if(params.command.split(' ')[1] && params.command.split(' ')[2], params.command.split(' ')[3], 
            params.command.split(' ')[4], params.command.split(' ')[5], params.command.split(' ')[6], params.command.split(' ')[7]){
                User.findOne({$or: [{username: params.command.split(' ')[3]}, {email: params.command.split(' ')[4]}]}, (err, userFound)=>{
                    if(err){
                        res.status(500).send({message: 'Error general'});
                    }else if(userFound){
                        res.status(200).send({message: 'Este usuario ya existente'});
                    }else{
                        user.name = params.command.split(' ')[1];
                        user.lastname = params.command.split(' ')[2];
                        user.username = params.command.split(' ')[3];
                        user.email = params.command.split(' ')[4];
                        user.password = params.command.split(' ')[5];
                        user.country = params.command.split(' ')[6];
                        user.age = params.command.split(' ')[7];
                        user.followers = 0;
    
                        bcrypt.hash(params.command.split(' ')[5], null, null, (err, passwordHash)=>{
                            if(err){
                                res.status(500).send({message: 'Error al encriptar la contraseña'});
                            }else if(passwordHash){
                                user.password = passwordHash;
                                user.save((err, saveUser)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error general al realizar la peticion'})
                                    }else if(saveUser){
                                        res.status(200).send({message: 'Usuario guardado', saveUser});
                                    }else{
                                        res.status(418).send({message: 'Intentes mas tarde'})
                                    }
                                })
                            }else{
                                res.status(418).send({message: 'Encripte su contraseña mas tarde'});
                            }
                        });
                    }    
                });
        }else{
            res.status(404).send({message: 'Debe de ingresar los datos necesarios que son: 1 Nombre, 1 Apellidos, Username, Email, Contraseña, Pais y Edad en este orden'});
        }
            break;
        case('login'):
            var params = req.body;
            var command = params.command;
            if(command.split(' ')[1] && command.split(' ')[2]){
                User.findOne({$or: [{email: command.split(' ')[1]}, {username: command.split(' ')[1]}, {name: command.split(' ')[1]}]}, (err, check)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al realizar la peticion'})
                    }else if(check){
                        bcrypt.compare(command.split(' ')[2], check.password, (err, passwordOk)=>{
                            if(err){
                                res.status(500).send({message: 'Error al comparar las contraseñas'});
                            }else if(passwordOk){
                                if(params.gettoken = true){
                                    res.send({token: jwt.createToken(check), user: check.name});
                                }else{
                                    res.send({message: 'Error en el servidor al generar la autenticacion'});
                                }
                            }else{
                                res.send({message: 'Contraseña incorrecta, intente de nuevo'})
                            }
                        });
                    }else{
                        res.send({message: 'El email o username no existen, intente de nuevo con uno correcto'});
                    }
                });
            }else{
                res.send({message: 'Ingrese los datos minimos correspondientes'});
            }
            break;
        case('profile'):
            var params = req.body;
            var command = params.command;
    
            if(command.split(' ')[1]){
                User.findOne({username: params.command.split(' ')[1].toLowerCase()}, {password: 0}, (err, profileFound)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al realizar la peticion'});
                    }else if(profileFound){
                            res.status(200).send({message: 'Perfil de ' + profileFound.username, profileFound});
                    }else{
                        res.status(404).send({message: 'No se encontro este usuario'});
                    }
                }).populate('tweets');
            }else{
                res.send({message: 'Debe de ingresar un nombre valido'})
            }
            break;
        case('add_tweet'):
            var tweet = new Tweet();
            var user = new User();
            var params = req.body;
            var command = params.command;
            if(command.split(' ')[1] && command.split(' ').length < 50){
                var content = ''; 
                for(let i = 1; i <= 50; i++){
                    if(command.split(' ')[i] != null){
                        var content = content + command.split(' ')[i] + ' ';
                    }else if(command.split(' ')[i] == null){
                        i = 50;
                    }
                }
                tweet.tweet = content;
                tweet.date = currentDate;
                tweet.likes = 0;
                tweet.userProperty = req.user.username;
                tweet.numberOfRetweets = 0;
                tweet.numberOfResponses = 0;
    
                tweet.save((err, tweetSaved)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al realizar la peticion', err});
                    }else if(tweetSaved){
                        User.findOneAndUpdate({_id: req.user.sub}, {$push: {tweets: tweet}}, {new: true}, (err, tweetPost)=>{
                            if(err){
                                res.status(500).send({message: 'Error general al realizar la peticion de usuario'});
                            }else if(tweetPost){
                                var tweetText = tweetPost.tweets;
                                var tweetUser = tweetPost.username;
                                res.send({message: 'Tweet posteado correctamente', tweetText, tweetUser});
                            }else{
                                res.status(418).send({message: 'No se ha podidod postear el tweet en tu perfil'})
                            }
                        }).populate('tweets');  
                    }else{
                        res.status(418).send({message: 'No se ha podido crear el tweet'});
                    }
                })
            }else{
                res.send({message: 'Debe de ingresar los datos minimos'})
            }
            break;
        case('delete_tweet'):
            var params = req.body;
            var command = params.command;
            var tweet = new Tweet();
            var id = command.split(' ')[1];
            
            User.findOne({_id: req.user.sub}, (err, userFound)=>{
                if(err){
                    res.status(500).send({message: 'Error general al realizar la peticion'});
                }else if(userFound){
                    var exist = false;
                    for (let i = 0; i < userFound.tweets.length; i++) {
                        if(userFound.tweets[i] == command.split(' ')[1]){
                            exist = true;
                            i = userFound.tweets.length;
                        }
                    }
                    if(exist == true){
                        Tweet.findByIdAndRemove(id, (err, tweetDeleted)=>{
                            if(err){
                                res.status(500).send({message: 'Error al realizar la peticion'})
                            }else if(tweetDeleted){
                                res.send({message: 'Tweet borrado correctamente', tweetDeleted});
                            }else{
                                res.status(418).send({message: 'Este tweet no existe'});
                            }
                        });
                    }else if(exist == false){
                        res.status(403).send({message: 'El tweet que quiere eliminar no existe en tu perfil'})
                    }
                }else{
                    res.status(403).send({message: 'No se ha encontrado el usuario propietario del Tweet'});
                }
            })
            break;
        case('edit_tweet'):  
            var params = req.body;
            var command = params.command;
            if(command.split(' ')[2] && command.split(' ').length < 50){
                User.findOne({_id: req.user.sub}, (err, userFound)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al realizar la peticion'});
                    }else if(userFound){
                        var exist = false;
                        for(let i = 0; i < userFound.tweets.length; i++){
                            if(userFound.tweets[i] == command.split(' ')[1]){
                                exist = true
                                i = userFound.tweets.length;
                            }
                        }
                        if(exist == true){
                            var content = ''; 
                            for(let i = 2; i <= 50; i++){
                                if(command.split(' ')[i] != null){
                                    var content = content + command.split(' ')[i] + ' ';
                                }else if(command.split(' ')[i] == null){
                                    i = 50;
                                }
                            }
                            Tweet.findByIdAndUpdate({_id: command.split(' ')[1]}, {tweet: content}, {new: true}, (err, tweetUpdated)=>{
                                if(err){
                                    res.status(500).send({message: 'Error general al realizar la peticion 1'});
                                }else if(tweetUpdated){
                                    res.send({message: 'Tweet editado correctamente', tweetUpdated});
                                }else{
                                    res.status(403).send({message: 'El tweet que quiere editar no existe'});
                                }
                            });
                        }else if(exist == false){
                            res.send({message: 'No puedes editar un tweet que no es de tu propiedad'});
                        }
                    }else{
                        res.status(404).send({message: 'No se ha podido encontrar tu usuario para editar el Tweet'})
                    }
                });
            }else{
                res.send({message: 'Debe de ingresar los datos necesarios en este orden, Instruccion, Id del Tweet que desa editar y Nuevo texto del Tweet'})
            }    
            break;
        case('follow'): 
            var params = req.body;
            var command = params.command;  
            var prueba = command.split(' ')[1]; 
            if(command.split(' ')[1]){
                User.findOne({username: command.split(' ')[1]   }, (err, userFound)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al realizar la peticion'});
                    }else if(userFound){
                        User.findOne({username: req.user.username}, (err, user1Found)=>{
                            if(err){
                                res.status(500).send({message: 'Error general al realizar la peticion 3'});
                            }else if(user1Found){
                                if(user1Found.username == command.split(' ')[1]){
                                    res.send({message: 'No puedes seguir a tu propio usuario'});
                                }else{
                                    var exist = false
                                    console.log(simplify(user1Found.followed, prueba));
                                    for(var i = 0; i < user1Found.followed.length; i++){
                                        if(user1Found.followed[i] == command.split(' ')[1]){
                                            exist = true;
                                            i = user1Found.followed.length;
                                        }
                                    }
                                    console.log(exist);
                                    if(exist == true){
                                        res.send({message: 'Ya sigues a este usuario'});
                                    }else if(exist == false){
                                        User.findOneAndUpdate({username: command.split(' ')[1]}, {followers: Number(userFound.followers + 1)}, {new: true}, (err, userUpdated)=>{
                                            if(err){
                                                res.status(500).send({message: 'Error general al realizar la peticion 1'})
                                            }else if(userUpdated){
                                                User.findOneAndUpdate({username: req.user.username}, {$push: {followed:command.split(' ')[1]}}, {new: true}, (err, userUpdated)=>{
                                                    if(err){
                                                        res.status(500).send({message: 'Error general al realizar la peticion 2'});
                                                    }else if(userUpdated){
                                                        res.send({message: 'Estas siguiendo a este usuario ' + userFound.username})
                                                    }else{
                                                        res.status(418).send({message: 'No se puede seguir a este usuario'});
                                                    }
                                                });
                                            }else{
                                                res.status(418).send({message: 'No se puede añadir este usuario a tu lista de seguidores'})
                                            }
                                        });
                                    }else{
                                        res.send({message: 'Ha ocurrido un error al buscar el usuario en tu perfil'})
                                    }
                                }
                            }else{
                                res.status(418).send({message: 'Ha ocurrido un error al encontrar obtener los datos'});
                            }
                        });
                    }else{
                        res.status(404).send({message: 'No se ha encontrado el usuario solicitado'});
                    }
                });
            }else{
                res.send({message: 'Debe de ingresar los datos necesarios'})
            }
            break;
        case('unfollow'):
            var params = req.body;
            var command = params.command.split(' ')[1];
            var id = req.user.sub;
    
            User.findOne({username: req.user.username}, (err, userFound)=>{
                if(err){
                    res.status(500).send({message: 'Error general al realizar la peticion'})
                }else if(userFound){
                    User.findOne({username: command}, (err, userUnfollowFound)=>{
                        if(err){
                            res.status(500).send({message: 'Error general al realizar la peticion'})
                        }else if(userUnfollowFound){
                            var exist = false;
                            var numberOfFollowers = userUnfollowFound.followers;
                            for(var i = 0; i < userFound.followed.length; i++ ){
                                if(userFound.followed[i] == command){
                                    exist = true;
                                    i = userFound.followed.length;
                                }
                            }
                            if(exist == true){
                                User.findOneAndUpdate({username: req.user.username}, {$pull: {followed: command}}, {new: true}, (err, userPrincipalUpdated)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error general al realizar la peticion 1', err})
                                    }else if(userPrincipalUpdated){
                                        User.findOneAndUpdate({username: command}, {followers: Number(numberOfFollowers - 1)}, {new: true}, (err, userUnfollowUpdated)=>{
                                            if(err){
                                                res.status(500).send({message: 'Error general al realizar la peticion'})
                                            }else if(userUnfollowFound){
                                                res.send({message: 'Se ha dejado de seguir al usuario ' + command});
                                            }else{
                                                res.status(418).send({message: 'Ha ocurrido un error al intentar dejar de seguir al usuario'})
                                            }
                                        });
                                    }else{
                                        res.status(418).send({message: 'La lista de seguidos no ha sido actualizada'});
                                    }
                                });
                            }else if(exist == false){
                                res.send({message: 'El usuario no existe en tu lista de seguidos'});
                            }
                        }else{
                            res.status(404).send({message: 'No se ha encontrado a el usuario para realizar la accion, verfique el nombre de usuario de nuevo'})
                        }
                    });
                }else{
                    res.status(404).send({message: 'No se han podido obtener tus datos de usuario'});
                }
            });
            break;
        case('view_alltweets'):
            Tweet.find((err, tweetsGotten)=>{
                if(err){
                    res.status(500).send({message: 'Error general al realizar la peticion'});
                }else if(tweetsGotten){
                    res.send({message: 'Tweets', tweetsGotten});
                }else{
                    res.status(403).send({message: 'No se han podido obtener los tweets, intente de nuevo'});
                }
            });
            break;
        case('view_tweets'):
            var params = req.body
            var command = params.command.split(' ')[1];
            if(command){
                User.findOne({username: command}, (err, userFound)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al realizar la peticion'});
                    }else if(userFound){
                        var tweets = userFound.tweets;
                        res.send({message: 'Tweets de usuario', tweets})
                    }else{
                        res.status(403).send({message: 'Este usuario no existe'});
                    }
                }).populate('tweets');
            }else{
                res.send({message: 'Debe de ingresar un dato valido'})
            }
            break;
        case('like_tweet'): 
            var params = req.body;
            var command = params.command.split(' ')[1];
            var idU = req.user.sub;
            if(command){
                Tweet.findById(command, (err, TweetFound)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al realizar la peticion, intente mas tarde 1'});
                    }else if(TweetFound){
                        var numberOFLIkes = TweetFound.likes;
                                User.findById(idU, (err, userFoundAction)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error general al realizar la peticion, intente mas tarde 2'});
                                    }else if(userFoundAction){ 
                                        Tweet.findById(command, (err, tweetFoundUser)=>{
                                            if(err){
                                                res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde :('});
                                            }else if(tweetFoundUser){
                                                if(simplify(userFoundAction.followed, tweetFoundUser.userProperty) == true){
                                                    if(simplify(userFoundAction.likeTweet, command) == true){
                                                        res.send({message: 'Ya has dado like a este tweet'});
                                                    }else if(simplify(userFoundAction.likeTweet, command) == false){
                                                            User.findByIdAndUpdate(idU, {$push: {likeTweet: command}}, {new: true}, (err, userLikeUpdated)=>{
                                                                if(err){
                                                                    res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde 3'});
                                                                }else if(userLikeUpdated){
                                                                    Tweet.findByIdAndUpdate(command, {likes: Number(numberOFLIkes + 1)}, {new: true}, (err, tweetLiked)=>{
                                                                        if(err){
                                                                            res.status(500).send({message:'Error general al realizar la peticion, intente de nuevo mas tarde 4', err});
                                                                        }else if(tweetLiked){
                                                                            res.send({message: 'Se ha dado Like al tweet correctamente', tweetLiked});
                                                                        }else{
                                                                            res.status(418).send({message: 'No se ha podido actualizar la cantidad de likes'});
                                                                        }
                                                                    });
                                                                }else{
                                                                    res.send(404).send({message: 'No se han podido actualizar los datos, intente de nuevo mas tarde'})
                                                                }
                                                            });
                                                    }
                                                }else if(simplify(userFoundAction.followed, tweetFoundUser.userProperty) == false){
                                                    res.send({message: 'No puedes realizar esta accion ya que no sigues al usuario propietario del tweet al que quieres dar like'});
                                                }
                                            }else{
                                                res.status(418).send({message: 'No se pudieron obtener los datos de usuario'});
                                            }
                                        })
                                    }else{
                                        res.status(404).send({message: 'No se ha encontrado el usuario solicitado'});
                                    }
                                }); 
                    }else{
                        res.status(404).send({message: 'Este tweet no Existe'});
                    }
                });
            }else{
                res.send({message: 'Debe de ingresar el id del tweet al que quiere darle like, de lo contrario la accion no se realizara'})
            }
            break;
        case('dislike_tweet'):
            var command = req.body.command.split(' ')[1];
            var idU = req.user.sub;

            Tweet.findById(command, (err, tweetFound)=>{
                if(err){
                    res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde'});
                }else if(tweetFound){
                    var usernamePropertyTweet = tweetFound.userProperty;
                    var likesTweet = Number(tweetFound.likes)
                            User.findById(idU, (err, userActionFound)=>{
                                if(err){
                                    res.status(500).send({message: 'Error al realizar la peticion, intente de nuevo mas tarde'});
                                }else if(userActionFound){
                                    if(simplify(userActionFound.followed, usernamePropertyTweet) == true){
                                            if(simplify(userActionFound.likeTweet, command) == true){
                                                User.findByIdAndUpdate(idU, {$pull: {likeTweet: command}}, {new:true}, (err, userLikeUpdated)=>{
                                                    if(err){
                                                        res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde'})
                                                    }else if(userLikeUpdated){
                                                        Tweet.findByIdAndUpdate(command, {likes: Number(likesTweet - 1)}, {new: true}, (err, tweetDLUpdated)=>{
                                                            if(err){
                                                                    res.status(500).send({message: 'Error general al realizar la peticion', err});
                                                            }else if(tweetDLUpdated){
                                                                res.send({message: 'Accion realizada correctamente', tweetDLUpdated})
                                                            }else{
                                                                res.status(418).send({message: 'Ha ocurrido un error al dar dislike al tweet'});
                                                            }
                                                        });
                                                    }else{
                                                        res.status(404).send({message: 'No se han podido actualizar los datos de usuario'});
                                                    }
                                                })
                                            }else if(simplify(userActionFound.likeTweet, command) == false){
                                                res.send({message: 'No puedes quitar tu like a un tweet al que aun no has dado like'})
                                            }
                                        
                                    }else if(simplify(userActionFound.followed, usernamePropertyTweet) == false){
                                        res.send({message: 'No puedes realizar la accion, ya que no sigues al propietario del tweet'})
                                    }
                                }else{
                                    res.status(404).send({message: 'Error al obtener los datos de usuario, intente de nuevo'})
                                }
                            })
                }else{
                    res.status(404).send({message: 'El tweet al que quiere dar Dislike no existe'});
                }
            })
            break;
        case('reply_tweet'):
            var command = req.body.command.split(' ');
            var textTweet = simplifyText(command);
            if(textTweet == null || textTweet == ""){
                res.send({message: 'Debe de ingresar los datos minimos'})
            }else{
                if(command[1] && command.length < 50){
                    Tweet.findById(command[1], (err, tweetVerification)=>{
                        if(err){
                            res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde'})
                        }else if(tweetVerification){
                                Tweet.findById(command[1], (err, tweetFound)=>{
                                    var quantityOfReply = tweetFound.numberOfResponses;
                                    if(err){
                                        res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde'})
                                    }else if(tweetFound){
                                        Tweet.findByIdAndUpdate(command[1], {$push: {response: {text: textTweet, userResponse: req.user.username, dateResponse: currentDate}}, numberOfResponses: Number(quantityOfReply + 1)}, {new: true}, (err, repleyGiven)=>{
                                            if(err){
                                                res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde'});
                                            }else if(repleyGiven){
                                                res.send({message: 'Respuesta la tweet hecha', repleyGiven})
                                            }else{
                                                res.status(418).send({message: 'No se pudo realizar la respuesta al tweet, intente de nuevo'})
                                            }
                                        });
                                    }else{
                                        res.status(404).send({message: 'El tweet al que quiere responder no existe, verifique si ingreso el tweet de manera correcta'})
                                    }
                                });
                            
                        }else{
                            res.status(404).send({message: 'El tweet indicado no existe, verifique los datos ingresados e intente de nuevo'});
                        }   
                    });
                }else{
                    res.send({message: 'Debe de ingresar los datos necesarios en el siguiente orden: Id del Tweet al que quiere responder seguido de un espacio y el texto el cual quiere adjuntar'});
                }
            }
            break;
        case('view_users'):
            User.find((err, userFound)=>{
                if(err){
                    res.status(500).send({message: 'Error general'});
                }else if(userFound){
                    res.send({Users: userFound})
                }else{
                    res.status(404).send({message: 'El tweet al que quiere dar Dislike no existe'});
                }
            });
            break;
        case('retweet'):
            var command = req.body.command.split(' ');
            var textRetweet = simplifyText(command);

            if(command[1] && command[2] && command.length < 50){
                Tweet.findById(command[1], (err, tweetVerification)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde'});
                    }else if(tweetVerification){
                        Tweet.findOne({_id: command[1]}, (err, tweetFoundCommentAndId)=>{
                            var quantityOfRetweet1 = tweetFoundCommentAndId.numberOfRetweets;
                            if(err){
                                res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde'});
                            }else if(tweetFoundCommentAndId){
                                User.findById(req.user.sub, (err, userFoundCommentAndId)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde', err});
                                    }else if(userFoundCommentAndId){
                                        if(simplify(userFoundCommentAndId.tweets, command[1]) == true){
                                            var indice = tweetFoundCommentAndId.retweet.indexOf(tweetFoundCommentAndId.retweet.find(item=>{
                                                return item.usernameRetweet == req.user.username;
                                            }));

                                            var idRetweet = tweetFoundCommentAndId.retweet[indice]._id;
                                            Tweet.findOneAndUpdate({_id:command[1], 'retweet.usernameRetweet': req.user.username}, {$pull: {retweet: {_id: idRetweet}}, numberOfRetweets: Number(quantityOfRetweet1 - 1)}, {new: true}, (err, tweetDeletedCommentAndId)=>{
                                                console.log(tweetDeletedCommentAndId)
                                                if(err){
                                                    res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde 1', err});
                                                }else if(tweetDeletedCommentAndId){
                                                    User.findByIdAndUpdate(req.user.sub, {$pull: {tweets: command[1]}}, {new: true}, (err, userDeletedCommentAndId)=>{
                                                        if(err){
                                                            res.send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde 2'});
                                                        }else if(userDeletedCommentAndId){
                                                            res.send({message: 'Retweet eliminado correctamente por el usuario ' + req.user.username, userDeletedCommentAndId})
                                                        }else{
                                                            res.send({message: 'No se han podido eliminar el retweet del usuario, intente de nuevo mas tarde'});
                                                        }
                                                    }).populate('tweets')
                                                }else{
                                                    res.status(418).send({message: 'No se ha podido eliminar el retweet, intente de nuevo'});
                                                }
                                            })
                                        }else if(simplify(userFoundCommentAndId.tweets, command[1]) == false){
                                            Tweet.findByIdAndUpdate(command[1], {$push: {retweet: {coment: textRetweet, usernameRetweet: req.user.username, dateRetweet: currentDate}}, numberOfRetweets: Number(quantityOfRetweet1 + 1)}, {new: true}, (err, tweetUpdatedCommentAndId)=>{
                                                if(err){
                                                    res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde'});
                                                }else if(tweetUpdatedCommentAndId){
                                                    User.findByIdAndUpdate(req.user.sub, {$push: {tweets: command[1]}}, {new: true}, (err, userUpdatedCommentAndId)=>{
                                                        if(err){
                                                            res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde'});
                                                        }else if(userUpdatedCommentAndId){
                                                            res.send({message: 'Retweet hecho correctamente', userUpdatedCommentAndId});
                                                        }else{
                                                            res.status(418).send({message: 'No se han podido actualizar los datos de usuario, intente de nuevo'});
                                                        }
                                                    }).populate('tweets')
                                                }else{
                                                    res.status(418).send({message: 'No se han podido actualizar los datos del tweet, intente de nuevo'});
                                                }
                                            });
                                        }
                                    }else{
                                        res.status(404).send({message: 'No se ha encontrado al usuario, ingrese los datos de manera correcta'});
                                    }
                                });
                            }else{
                                res.status(404).send({message: 'No se ha encontrado el tweet al cual quiere hacer retweet, verifice el ID e intente de nuevo'});
                            }
                        });
                    }else{
                        res.status(404).send({message: 'No se ha encontrado el tweet'})
                    }
                });
            }else if(command[1]){
                Tweet.findById(command[1], (err, tweetVerification2)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al realizar la accion, intente de nuevo mas tarde'});
                    }else if(tweetVerification2){
                        Tweet.findById(command[1], (err, tweetFoundOnlyId)=>{
                            var quantityOfRetweet = tweetFoundOnlyId.numberOfRetweets;
                            if(err){
                                res.status(500).send({message: 'Error general al realizar la accion, intente de nuevo mas tarde'});
                            }else if(tweetFoundOnlyId){
                                User.findById(req.user.sub, (err, userFoundOnlyId)=>{
                                    if(err){
                                        res.send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde'});
                                    }else if(userFoundOnlyId){
                                        if(simplify(userFoundOnlyId.tweets, command[1]) == true){
                                            var indice = tweetFoundOnlyId.retweet.indexOf(tweetFoundOnlyId.retweet.find(item=>{
                                                return item.usernameRetweet == req.user.username;
                                            }));
                                            var idRetweet2 = tweetFoundOnlyId.retweet[indice]._id;
                                            Tweet.findByIdAndUpdate(command[1], {$pull: {retweet: {_id: idRetweet2}}}, {new: true},(err, tweetDeletedOnlyId)=>{
                                                if(err){
                                                    res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde 1', err});
                                                }else if(tweetDeletedOnlyId){
                                                    Tweet.findByIdAndUpdate(command[1], {numberOfRetweets: Number(quantityOfRetweet - 1)}, {new: true}, (err, tweetNumberRetweetUpdated)=>{
                                                        if(err){
                                                            res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde more', err});
                                                        }else if(tweetNumberRetweetUpdated){
                                                            User.findByIdAndUpdate(req.user.sub, {$pull: {tweets: command[1]}}, {new: true}, (err, userDeletedOnlyId)=>{
                                                                console.log(2)
                                                                if(err){
                                                                    res.status(500).send({message: 'Error general al realizar la peticion, intente de nuevo mas tarde 2', err});
                                                                }else if(userDeletedOnlyId){
                                                                    res.send({message: 'Retweet eliminado por el usuario ' + req.user.username, message2: userDeletedOnlyId})
                                                                }else{
                                                                    res.status(418).send({message: 'No se han podido actualizar los datos del usuario, intente de nuevo err'});
                                                                }
                                                            })
                                                        }else{
                                                            res.status(418).send({message: 'No se han podido actualizar los datos del tweet, intente de nuevo'});
                                                        }
                                                    })
        
                                                }else{
                                                    res.status(418).send({message: 'No se han podido actualizar los datos del tweet, intente de nuevo'});
                                                }
                                            })
                                        }else if(simplify(userFoundOnlyId.tweets, command[1]) == false){
                                            Tweet.findByIdAndUpdate(command[1], {$push: {retweet: {usernameRetweet: req.user.username, dateRetweet: currentDate}}, numberOfRetweets: Number(quantityOfRetweet + 1)}, {new: true}, (err, tweetUpdatedOnlyId)=>{
                                                if(err){
                                                    res.status(500).send({message: 'Error general al realizar la peticion 1', err});
                                                }else if(tweetUpdatedOnlyId){
                                                    User.findByIdAndUpdate(req.user.sub, {$push: {tweets: command[1]}}, {new: true}, (err, userUpdatedOnlyId)=>{
                                                        if(err){
                                                            res.status(500).send({message: 'Error general al realizar la peticion 2', err});
                                                        }else if(userFoundOnlyId){
                                                            res.send({message: 'Retweet hecho por el usuario ' + req.user.username, message2: userUpdatedOnlyId.tweets});
                                                        }else{
                                                            res.status(418).send({message: 'No se puediero actualizar los datos de usuario'});
                                                        }
                                                    }).populate('tweets');
                                                }else{
                                                    res.status(418).send({message: 'No se pudieron actualizar los datos del tweet, intente de nuevo'})
                                                }
                                            })
                                        }
                                    }else{
                                        res.status(404).send({message: 'No se ha encntrado al usuario, verifique los datos ingresados'});
                                    }
                                })
                            }else{
                                res.status(404).send({message: 'No se encontro el tweet solicitado, verifique los datos ingresados'});
                            }
                        })
                    }else{
                        res.status(404).send({message: 'No se ha encontrado el tweet'});
                    }
                })
            }else{
                res.send({message: 'Los datos necesarios para poder realizar una accion son: "Instruccion" "ID del Tweet" "Mensaje(Opcional)"'})
            }
            break

        default:
            res.send({message: 'Debe de ingresar una instrucion valida, ejemplo de instrucciones validas: register, login, profile, add_tweet, delete_tweet, edit_tweet, follow y unfollow'})
    }
}


module.exports = {
    commands
}
