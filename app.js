var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require("express");
var authentication = require("./services/security");
var app = express();
var port = 3700;

app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

io.sockets.on('connection', function (socket) {
  socket.auth = false;
  socket.emit('message', { message: 'Local announcement> Welcome to the chat' });

  // handle authentication
  socket.on('authenticate', function (credentials) {
    console.log('Authentication attempt, login = ' + credentials.userName);
    socket.auth = authentication.authenticate(credentials);
    if(socket.auth) {
      socket.userName = credentials.userName;
      socket.emit('goChat');
      io.sockets.emit('message', {message: 'System announcement> ' + socket.userName + ' vient de se connecter'});
      io.sockets.emit('userConnection', {})
    }
  });

  // handle message transaction
  socket.on('send', function (data) {
    if(socket.auth) {
      data.message = socket.userName + '> ' + data.message;
      io.sockets.emit('message', data);
      console.log("New message");
    }
  });
});


app.get("/", function(req, res){
  res.render("index");
});
