// Server setup
var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public' ));

app.post('/', function( req ,res){
  res.send("Success");
});

// Create users variable
var users = {};

// Handle connections
io.on('connection', function(socket)
{
  console.log('a user connected');
  // When a new user joins, update the users object for everyone
  socket.on('newConnection', function(msg)
  {
    users[socket.id] = {};
    users[socket.id]['name'] = msg;
    users[socket.id]['status'] = 'online';
    io.emit('currentUsers', users);
  });
  // When a user leaves, update the users object
  socket.on('disconnect', function()
  {
    console.log('user disconnected');
    delete users[socket.id];
    io.emit('currentUsers', users);
  });
  // When a user moves, update the users object
  socket.on('queueEntered', function(msg)
  {
    users[socket.id]['status'] = msg;
    io.emit('currentUsers', users);
  });
});

// Set the server to listen on port 3000
http.listen(3000, function()
{
  console.log('listening on *:3000');
});