// Server setup
var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const fs = require('fs');

app.use(express.static(__dirname + '/public' ));

app.post('/', function( req ,res){
  res.send("Success");
});

// Create users variable
var users = {};
var mail = []

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
    users[socket.id]['mail'] = [];
    users[socket.id]['cleanup'] = [];
    io.emit('currentUsers', users);
  });

  // When a new user joins, update the users object for everyone
  socket.on('reset', function()
  {
    for (user in users)
    {
      users[user]['status'] = 'online';
      users[user]['mail'] = [];
      users[user]['cleanup'] = [];
    }
    
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
    fs.appendFile('/home/james/status/public/admin/data.csv', users[socket.id]['name'] + ',' + users[socket.id]['status'] + ',' + new Date().toLocaleString() + '\n', function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  });

  socket.on('clearCSV', function(msg)
  {
    fs.writeFile('/home/james/status/public/admin/data.csv', "Name,Queue,Date,Time\n", function(err)
    {
      if(err){console.log(err);}
    });
  });
  // When a user enteres a mail slot, update the users object
  socket.on('mailEntered', function(msg)
  {
    times = ['7:30 am', '12:30 pm', '7:30 pm'];
    if(users[socket.id]['mail'][msg] == users[socket.id]['name'])
    {
      fs.appendFile('/home/james/status/public/admin/data.csv', users[socket.id]['name'] + ',' + 'left the ' + times[msg] + ' mail slot,' + new Date().toLocaleString() + '\n', function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
      delete users[socket.id]['mail'][msg];
      console.log('Mail exists for user');
    }
    else
    {
      users[socket.id]['mail'][msg] = users[socket.id]['name'];
      fs.appendFile('/home/james/status/public/admin/data.csv', users[socket.id]['name'] + ',' + 'entered the ' + times[msg] + ' mail slot,' + new Date().toLocaleString() + '\n', function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
    }
    io.emit('currentUsers', users);
  });

  // When a user enteres a cleanup slot, update the users object
  socket.on('cleanupEntered', function(msg)
  {
    times = ['6 am-8 am', '9 am-11 am', '1 pm-3 pm', '4 am-6 pm', '10 pm-12 pm', '3 am-5 am'];
    if(users[socket.id]['cleanup'][msg] == users[socket.id]['name'])
    {
      fs.appendFile('/home/james/status/public/admin/data.csv', users[socket.id]['name'] + ',' + 'left the ' + times[msg] + ' cleanup slot,' + new Date().toLocaleString() + '\n', function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
      delete users[socket.id]['cleanup'][msg];
      console.log('Cleanup exists for user');
    }
    else
    {
      users[socket.id]['cleanup'][msg] = users[socket.id]['name'];
      fs.appendFile('/home/james/status/public/admin/data.csv', users[socket.id]['name'] + ',' + 'entered the ' + times[msg] + ' cleanup slot,' + new Date().toLocaleString() + '\n', function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
    }
    io.emit('currentUsers', users);
  });
});
// Set the server to listen on port 3000
http.listen(3000, function()
{
  console.log('listening on *:3000');
});