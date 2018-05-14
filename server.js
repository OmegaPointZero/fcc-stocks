const express = require('express');
const http = require('http');
const app = express();
require('dotenv').config();
const morgan = require('morgan');
// const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const configDB = require('./config/database.js');
const mongoose = require('mongoose');
/*
 Thank you to Peter Chang of HackerNoon.com for the 
WebSockets tutorial I built this on top of 
https://hackernoon.com/nodejs-web-socket-example-tutorial-send-message-connect-express-set-up-easy-step-30347a2c5535
*/

// require('./config/passport')(passport);
mongoose.connect(configDB.url);
console.log('connected to mongoose...');

app.use(morgan('dev')); //log reqs to console

//Required for passport, leave until user authentication

app.use(session({secret: process.env.SESSION_SECRET}));
//app.use(passport.initialize());
//app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req,res,next){
    res.setTimeout(480000, function(){
            console.log('Request has timed out');
                res.send(408);
        });
    
    next();
});

//route module
require('./app/routes.js')(app);

//set the fuckin' view engine to ejs for Express
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.listen(process.env.PORT);
console.log('Listening for connections on ', process.env.PORT);
