const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let prevUser = null
let clients = []
io.on('connection', (socket) => {
  let id = Math.floor(Math.random() * 100)
  let nickname = null
  let displayedName = nickname || id
  console.log(`USER_ID:${displayedName} has connected`);
  let client = clients.find(c => c.userId === id)
  //  Register user into the pool if hasn't been registered yet
  if (!client) {
    const clientData = {userId: id, messages:[]}
    clients.push(clientData)
    client = clientData 
  }
  socket.on('disconnect', () => {
    console.log(`${displayedName} has disconnected`);
    io.emit(`chat message`, `${displayedName} has disconnected`)
  });
  socket.on('chat message', (msg) => {
    client.messages.push(msg)
    console.debug(clients)
    //  CHanging nickname
    if (msg.startsWith(`/nickname`)) {
      const newNickname = msg.split(` `).slice(1).join(` `)
      io.emit(`chat message`, `${displayedName} has changed their nickname to ${newNickname}!`)
      return nickname = newNickname
    }
    prevUser = id
    io.emit('chat message', `${displayedName}: ${msg}`, prevUser === id ? true : false);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});