const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.info('Server listening on port 3000');
});

let connectedUsers = [];

io.on('connection', (socket) => {

    socket.on('join-request', (username) => {
        let hasName = connectedUsers = connectedUsers.filter(u => u.toLowerCase() == username.toLowerCase());

        if (hasName.length > 0) {
            username += '#' + Math.floor(Math.random() * 1000).toString();
        }

        socket.username = username;
        connectedUsers.push(username);
        console.log( connectedUsers );

        // emite esse evento apenas para a conexao atual
        socket.emit('user-ok', {
            list: connectedUsers,
            username
        });

        // emite este evento para todas as conexoes
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        });
    });

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(u => u !== socket.username);

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