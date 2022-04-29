const socket = io();

let username = '';
let userList = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');

let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');

loginInput.focus();

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

function renderUserList() {
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';

    userList.forEach(i => {
        ul.innerHTML += `<li>${i}</li>`;
        console.log(ul.innerHTML);
    });
}

function addMessage(type, user, message) {
    let ul = document.querySelector('.chatList');

    switch (type) {
        case 'status':
            ul.innerHTML += `<li class="m-status">${message}</li>`;
        break;
        case 'msg':            
            ul.innerHTML += `<li class="m-txt"><span ${username == user ? 'class="me"' : ''}>${user}</span>: ${message}</li>`;
        break;
    }

    ul.scrollTop = ul.scrollHeight;
}

loginInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let name = loginNameInput.value.trim() + '#' + Math.floor(Math.random() * 1000).toString();
        if (name !== '') {
            username = name;
            document.title = `Chat (${username})`;
            socket.emit('join-request', username);
        }
    }
});

textInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let msg = textInput.value.trim();
        textInput.value = '';

        if (msg !== '') {
            addMessage('msg', username, msg);
            socket.emit('send-msg', msg);
        }
    }
});

socket.on('user-ok', (list) => {    
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();
    
    addMessage('status', null, 'Conectado!');

    userList = list;
    renderUserList();
});

socket.on('list-update', (data) => {
    // adicionar mensagem de servidor com entrada/saida de usuario
    if (data.joined) {
        addMessage('status', null, `${data.joined} entrou no chat.`);
    }

    if (data.left) {
        addMessage('status', null, `${data.left} saiu no chat.`);
    }

    // atualizando a lista de usuario
    userList = data.list;
    renderUserList();
});

socket.on('show-msg', (data) => {
    addMessage('msg', data.username, data.message);
});

socket.on('disconnect', () => {
    addMessage('status', null, 'Você foi desconectado!');
    userList = [];
    renderUserList();
});

socket.on('connect_error', () => {
    addMessage('status', null, 'Tentando reconectar...');
});

socket.on('connect', () => {
    if (username != '') {
        socket.emit('join-request', username);
    }
});