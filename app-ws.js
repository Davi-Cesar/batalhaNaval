const WebSocket = require('ws');

let clients = [];
let salas = [];

for (var i = 0; i < 10; i++) {
    salas.push({
        status: "empty",
        players: [],
        id: i + 1
    })
}

console.log(salas);
function onSalas(ws, data , salas) {
    console.log(`onMessage: ${data}`);
    ws.send(salas);
}

function onError(ws, err) {
    console.error(`onError: ${err.message}`);
}
 
function onMessage(ws, data, salas) {
    console.log(`onMessage: ${data}`);
    const json = JSON.parse(data);
    ws.send(JSON.stringify({
        type: 'confirmation',
        data: 'Recebido',
        salas: "listar salas"
    }));
    console.log('streaming to', clients.length, 'clients');
    
    for (const client of clients) {
        console.log('envio?', data.toString());
        client.send(JSON.stringify({
            type: 'broadcast',
            username: json.username,
            message: json.message,
            salas: json.salas,
            size: json.id.length
        }));
    }
}

function onClose(ws, reasonCode, description) {
    console.log(`onClose: ${reasonCode} - ${description}`);
    const index = clients.indexOf(ws);
    if (index > -1) {
        clients.splice(index, 1);
    }
}
 
function onConnection(ws, req) {
    clients.push(ws);
    ws.on('message', data => onMessage(ws, data, salas));
    ws.on('message', data => onSalas(ws, salas, data));
    ws.on('error', error => onError(ws, error));
    ws.on('close', (reasonCode, description) => onClose(ws, reasonCode, description));
    ws.send(JSON.stringify({
        salas: salas,
        status: salas.map((s) => s.status),
        id: salas.map((s) => s.id)
    }))
    console.log(`onConnection`);
}
 
module.exports = (server) => {
    const wss = new WebSocket.Server({
        server
    });
    
    wss.on('connection', onConnection);
 
    console.log(`App Web Socket Server is running!`);
    return wss;
}