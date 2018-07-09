var express = require('express'),
    app = express(),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    config = require('./config/config.js'),
    connectMongo = require('connect-mongo')(session),
    mongoose = require('mongoose'),
    passport = require('passport'),
    facebookStrategy = require('passport-facebook').Strategy ,
    rooms = [] ;

app.set('views',path.join(__dirname,'views'));
app.engine('html',require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname,'public'))); //where shud express look for css files and all
app.use(cookieParser())

mongoose.connect(config.dbURL, function(err) {
  if(err != undefined){
    console.log("MONGOOSE-CONNECT: " + err);
  } else {
    console.log("MONGOOSE-CONNECT: Database connection established");
  }
});

var env = process.env.NODE_ENV || 'development';
if(env === 'development'){
    //dev specific settings
    app.use(session({secret:config.sessionSecret,saveUninitialized:true,resave:true}))
}else{
    //production specific
    app.use(session({secret:config.sessionSecret,saveUninitialized:true,resave:true,
                store: new connectMongo({
                    url: config.dbURL,
                //]   mongoose_connection:mongoose.connections[0],
                    stringify:true
                })
    }))
}
app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport,facebookStrategy,config,mongoose);
require('./routes/route.js')(express,app,passport,config,rooms);

// app.listen(3000,function(){
//     console.log('working');
//     console.log('Mode:' + env);
// })
app.set('port',process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io,rooms);
server.listen(app.get('port'),function(){
    console.log('chatcat on port : ' + app.get('port'));
})