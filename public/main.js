const socket = io();

let username = '';
let userList = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');

let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');
let buttonLogin = document.querySelector('#buttonLogin')

let userListHTML = document.querySelector('.userList');

loginInput.focus();

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

if (window.screen.availWidth <= 450) {
    userListHTML.classList.add("hide");
} else {
    userListHTML.classList.remove("hide");
}

addEventListener("load", function() {
    var viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);
})

function renderUserList() {
    userListHTML.innerHTML = 'Usuários conectados<hr>';

    userList.forEach(i => {
        userListHTML.innerHTML += `<li>${i} ${i == username ? '(Você)' : ''}</li>`;
    });

    // let ul = document.querySelector('.userList');
    // ul.innerHTML = '';

    // userList.forEach(i => {
    //     ul.innerHTML += `<li>${i}</li>`;
    //     console.log(ul.innerHTML);
    // });
}

function addMessage(type, user, message) {
    let ul = document.querySelector('.chatList');

    switch (type) {
        case 'status':
            ul.innerHTML += `<li class="m-status">${message}</li>`;
        break;
        case 'msg':
            if (username == user) {
                ul.innerHTML += `<li class="m-txt1"><span class="me">Eu</span> - ${ new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString() }</br>${message}</li>`;
            } else {
                ul.innerHTML += `<li class="m-txt2"><span>${user}</span> - ${ new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString() }<br>${message}</li>`;
            }
        break;
    }

    ul.scrollTop = ul.scrollHeight;
}

function sendMessage() {
    let msg = textInput.value.trim();

    textInput.value = '';

    if (msg != '') {
        addMessage('msg', username, msg);
        socket.emit('send-msg', msg);
    }
}

function login() {
    let name = loginNameInput.value.trim();

    if (name !== '') {
        username = name;
        document.title = `Chat (${username})`;
        socket.emit('join-request', username);
    }
}

loginInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        login();
    }
});

buttonLogin.addEventListener('click', (e) => {
    login();
});

textInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        sendMessage();
    }
});

userListHTML.addEventListener('click', (e) => {
    if (userListHTML.classList.contains('hide')) {
        userListHTML.classList.remove("hide");
    } else {
        userListHTML.classList.add("hide");
    }
});

document.querySelector('#chatButtonSend').addEventListener('click', (e) => {
    sendMessage();
});

socket.on('user-ok', (obj) => {    
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();
    
    addMessage('status', null, 'Usuário conectado!');

    userList = obj.list;
    username = obj.username;
    renderUserList();
});

socket.on('list-update', (data) => {
    // adicionar mensagem de servidor com entrada/saida de usuario
    if (data.joined) {
        addMessage('status', null, `${data.joined} entrou no chat.`);
    }

    if (data.left) {
        addMessage('status', null, `${data.left} saiu do chat.`);
    }

    // atualizando a lista de usuario
    userList = data.list;
    renderUserList();
});

socket.on('show-msg', (data) => {
    addMessage('msg', data.username, data.message);
});

socket.on('disconnect', () => {
    addMessage('status', null, 'Seu usuário foi desconectado!');
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