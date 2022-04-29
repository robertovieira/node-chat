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
        username = username.toLowerCase();

        let hasName = connectedUsers.includes(username);
        // let hasName = connectedUsers.filter(u => u.toLowerCase() == username.toLowerCase());

        if (hasName) {
            let foundNewUser = false;
            let newUser = '';

            // procura um nome disponivel
            while (!foundNewUser) {
                newUser = username + '#' + Math.floor(Math.random() * 1000).toString();

                hasName = connectedUsers.includes(newUser);

                if (!hasName) {
                    username = newUser;
                    foundNewUser = true;
                }
            }

            // username += '#' + Math.floor(Math.random() * 1000).toString();

            // hasName = connectedUsers.includes(username);

            // if (hasName) {
            //     username += '1';
            // }
        }

        socket.username = username;
        connectedUsers.push(username);

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