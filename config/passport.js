const LocalStrategy = require('passport-local').Strategy
const User = require('../app/models/user')
const mongo = require('mongodb').MongoClient;
const configDB = require('../config/database.js');

module.exports = function(passport) {

    passport.serializeUser(function(user, done){
        done(null, user.id)
    })

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err,user)  
        })
    })

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // send entire request to the callback function on next line
    },
        function(req, email, password, done){
            console.log(req.body);
            User.findOne({'email':email}, function(err, user){
                if(err)
                    return done(err);

            if(user){ 
                return done(null, false, req.flash('signupMessage', 'That email is already in use.'));
            } else {
                console.log('Need to make new user');
                var newUser = new User();
                newUser.email = email;
                newUser.password = newUser.generateHash(password);
                newUser.isAdmin = false;
                newUser.firstname = req.body.firstname;
                newUser.lastname = req.body.lastname;
                newUser.save(function(err){
                    if(err)
                        throw err;
                    return done(null, newUser);
                    });
                };
            });
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    }, function (req, email, password, done) {
        User.findOne({'email' : email }, function(err,user){
            if(err)
                return done(err);

            if(!user)
                return done(null, false, req.flash('loginMessage', 'No email/username found.'));

            if(!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Password incorrect'));

            //if everything's good, give use the user
            return done(null, user)
        });
    }));
};
