const express 		= require('express');
const compression 	= require('compression');
const helmet 		= require('helmet');
const bodyParser 	= require('body-parser'); 		 
const cors 			= require('cors');
const http 			= require('http');
const https			= require('https');

const passport      = require('passport')
const JwtStrategy   = require('passport-jwt').Strategy
const ExtractJwt    = require('passport-jwt').ExtractJwt
const GoogleStrategy= require('passport-google-oauth20').Strategy;

const config 		= require("./config/config");
const authRoute 	= require('./routes/auth');
 
const file1 		= config.CERT_FILE1;
const file2 		= config.CERT_FILE2;
const file3			= config.CERT_FILE3;

const port 			= config.API_PORT;

const app 			= express(); 
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.json()); 
 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

app.use(function (req, res, next) {  
    res.setHeader('Access-Control-Allow-Origin', '*');    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');   
    res.setHeader('Access-Control-Allow-Headers', '*');   
    res.setHeader('Access-Control-Allow-Credentials', true);   
    next();
});
  
app.get('/', (req, resp) => {
	resp.send("<h1>Wow ! Server Running &#128525;</h1>");
});

// OAuth Authentication, Just going to this URL will open OAuth screens
app.get('/auth/google',  passport.authenticate('google', { scope: ['profile','email'] }))

// Route Middlewares
 app.use('/api/user', authRoute);



var options = {};

 
app.listen(port, function() {
    console.log('App listening on port : '+port);
});