const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');
app.use(express.static(path.join(__dirname,"public")));

const Users = {};

app.get('/', (req, res) => {
  res.sendFile('/index.html',options);
});

app.get('/info', (req, res) => {
  res.sendFile(__dirname + '/public/info.html');
});

io.on('connection', (socket) => {
  socket.on('login', (msg) => {
    // console.log(msg);
    if(Users[msg[2]]){
      socket.emit("LoginOccupied",`Stanowisko zajęte przez użytkownika ${Users[msg[2]].value.join(" ")}`)
    }else{
      Users[msg[2]] = {};
      Users[msg[2]].value = msg;
      Users[msg[2]].id = socket.id;
    }
  });

  console.log('a user connected');

  socket.on('disconnect',(reason)=>{
    const user = Object.keys(Users).find(key => Users[key].id == socket.id);
    // console.log(user);
    if(user) delete Users[user];
    // console.log("user disconnected");
    // console.log(Users);
  });
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});