var express = require("express");
var path = require('path');
var authentication = require("./services/security");
var app = express();

var ipaddress = process.env.OPENSHIFT_NODEJS_IP;
var port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

var date = new Date();

app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get("/", function(req, res){
  res.render("index");
});

var io = require('socket.io').listen(app.listen(port, ipaddress));

io.sockets.on('connection', function (socket) {
  socket.auth = false;
  socket.emit('message', { message: 'Local announcement> Welcome to the chat' });

  // handle authentication
  socket.on('authenticate', function (credentials) {
    console.log('Authentication attempt, login = ' + credentials.userName);
    socket.auth = authentication.authenticate(credentials);
    if(socket.auth) {
      socket.userName = credentials.userName;
      socket.emit('goChat', credentials.userName);
      io.sockets.emit('message', {message: 'System announcement> ' + socket.userName + ' vient de se connecter'});
      io.sockets.emit('userConnection', {user: socket.userName});
    }
  });

  // handle disconnection
  socket.on('disconnect', function() {
    io.sockets.emit('disconnection', {user: socket.userName});
    io.sockets.emit('message', {message: 'Ststem announcement> ' + socket.userName + ' vient de se deconnecter'});
  });

  // handle message transaction
  socket.on('send', function (data) {
    if(socket.auth) {
      var europeanHour = date.getHours() + 6;
      data.message = '' + europeanHour + ':' + date.getMinutes() + ' ' + socket.userName + '> ' + data.message;
      io.sockets.emit('message', data);
      console.log("New message");
    }
  });
});
