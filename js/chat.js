window.onload = function() {

  var messages = [];
  var socket = io.connect('http://localhost:3700');
  var field = document.getElementById("prompt");
  var form = document.getElementById("controls");
  var sendButton = document.getElementById("send");
  var loginField = document.getElementById("login");
  var passwordField = document.getElementById("pass")
  var authenticateButton = document.getElementById("authenticate");
  var content = document.getElementById("content");

  socket.on('message', function (data) {
    if(data.message) {
        messages.push(data.message);
        var html = '';
        for(var i=0; i<messages.length; i++) {
            html += messages[i] + '<br />';
        }
        content.innerHTML = html;
    } else {
        console.log("There is a problem:", data);
    }
  });

  socket.on('goChat', function() {
    document.getElementById("loginArea").style.display = 'none';
    document.getElementById("contentArea").style.display = 'block';
  });

  sendButton.onclick = function() {
    var text = field.value;
    socket.emit('send', { message: text });
  };

  authenticateButton.onclick = function() {
    var login = loginField.value;
    var password = passwordField.value;
    socket.emit('authenticate', {userName: login, password: password});
  };

}
