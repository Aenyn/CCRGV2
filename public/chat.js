var messages = [];
var users = [];
var newMessages = 0;
var socket;
var field;
var form;
var sendButton;
var loginField;
var passwordField;
var authenticateButton;
var content;
var userName;
var onlineUsers;

function sendMessage() {
  var text = field.value;
  field.value = '';
  field.focus()
  socket.emit('send', { message: text });
  return false;
}

function authenticate() {
  var login = loginField.value;
  var password = passwordField.value;
  socket.emit('authenticate', {userName: login, password: password});
  return false;
}

window.onload = function() {

  socket = io.connect('http://chat-ccrg.rhcloud.com:8000');
  field = document.getElementById("prompt");
  form = document.getElementById("controls");
  loginField = document.getElementById("login");
  passwordField = document.getElementById("pass")
  authenticateButton = document.getElementById("authenticate");
  content = document.getElementById("content");
  onlineUsers = document.getElementById("online");

  socket.on('message', function (data) {
    if(data.message) {
        messages.push(data.message);
        var html = '';
        for(var i=0; i<messages.length; i++) {
            html += messages[i] + '<br />';
        }
        content.innerHTML = html;
        content.scrollTop = content.scrollHeight;
    } else {
        console.log("There is a problem:", data);
    }
  });

  socket.on('userConnection', function (data) {
    if(data.user) {
        users.push(data.user);
        var html = 'Online right now:<br />';
        for(var i=0; i<messages.length; i++) {
            html += users[i] + '<br />';
        }
        onlineUsers.innerHTML = html;
    } else {
        console.log("There is a problem:", data);
    }
  });

  socket.on('goChat', function(user) {
    document.getElementById("loginArea").style.display = 'none';
    document.getElementById("contentArea").style.display = 'block';
    userName = user;
    document.getElementById("user").innerHTML = userName + '> ';
    field.focus();
  });

  socket.on('disconnection', function(data) {
    users.splice(users.indexOf(data.user), 1);
  });

  authenticateButton.onclick = authenticate;

  loginField.focus();
}
