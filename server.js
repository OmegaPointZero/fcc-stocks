const express = require('express');
const http = require('http');
const app = express();
require('dotenv').config();
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');

require('./config/passport')(passport);

console.log('connected to mongoose...');

app.use(morgan('dev')); //log reqs to console

//Required for passport, leave until user authentication

app.use(session({secret: process.env.SESSION_SECRET}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
    res.setTimeout(480000, function(){
            console.log('Request has timed out');
                res.send(408);
        });
    
    next();
});

//route module
require('./app/routes.js')(app,passport);

//set the fuckin' view engine to ejs for Express
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.listen(process.env.PORT);
console.log('Listening for connections on ', process.env.PORT);
