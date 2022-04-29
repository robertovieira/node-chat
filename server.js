const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000);
console.log('Server listening on port 3000');

let connectedUsers = [];

io.on('connection', (socket) => {
    console.log('New Connect');

    socket.on('join-request', (username) => {
        socket.username = username;
        connectedUsers.push(username);
        console.log( connectedUsers );

        // emite esse evento apenas para a conexao atual
        socket.emit('user-ok', connectedUsers);

        // emite este evento para todas as conexoes
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        });
    });

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(u => u !== socket.username);
        console.log(connectedUsers);

        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        });
    });

    socket.on('send-msg', (msg) => {
        let obj = {
            username: socket.username,
            message: msg
        };

        // enviando a mensagem de volta para a conexao que enviou a mensagem
        // socket.emit('show-msg', obj);

        // enviando mensagem para todas as conexoes
        socket.broadcast.emit('show-msg', obj);
    });
});