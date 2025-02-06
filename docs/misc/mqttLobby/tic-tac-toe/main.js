const client = mqtt.connect('wss://test.mosquitto.org:8081');
client.on('connect', () => {

});
class MqttProtocols {
    static JOIN = '102 Processing';
    static SWITCHING_PROTOCOLS = '101 Switching Protocols';
    static PING = '100 Continue';
    static PONG = '200 OK';
    static GAME_STATE = '202 Accepted';
    static FULL_LOBBY = '416 Request Range Not Satisfiable'
    static INVALID = '400 Bad Request';
    static KICKED = '205 Reset Content';
    static BAN = '403 Forbidden';
}

let lobbyId;
let clientIdListenTopic;
let clientConnections = {};
let maxClients = 1;
let clientIdentifier = Math.random().toString(16).substr(2, 8);
console.log(clientIdentifier);
let iAmHost = false;
let gameState;

// client.on('message', (topic, message) => {
//     const msg = message.toString();
//     receiveMessage(topic, msg);
// });

// client.publish(sendingPingRequestURL, JSON.stringify({ userId: settings.userId }));

let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

function generateGameCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

client.on('message', (topic, message) => {
    const msg = message.toString();
    let formatted;
    try {
        formatted = JSON.parse(msg);
    } catch (e) {
        return;
    }
    console.log(formatted);
    if (iAmHost && formatted.type === MqttProtocols.JOIN) {
        if (Object.keys(clientConnections).length < maxClients) {
            clientConnections[formatted.clientId] = {
                privateTopic: `https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/user/${formatted.clientId}/offset/${formatted.offset}/lobby/${lobbyId}/offset/${Math.random().toString(16).substr(2, 8)}`,
                lastMessageSent: Date.now(),
                lastMessageReceived: Date.now(),
            }
            client.subscribe(clientConnections[formatted.clientId].privateTopic, (err) => { });
            client.publish(`https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/user/${formatted.clientId}/offset/${formatted.offset}`, JSON.stringify({ type: MqttProtocols.SWITCHING_PROTOCOLS, privateTopic: clientConnections[formatted.clientId].privateTopic }));
        }
    } else if (!iAmHost && formatted.type === MqttProtocols.SWITCHING_PROTOCOLS) {
        unsubscribe(topic);
        lobbyId = formatted.privateTopic;
        client.subscribe(lobbyId, (err) => { });
        client.publish(lobbyId, JSON.stringify({ type: MqttProtocols.OK, messageFromServer: false }));
    }
});

function showHostScreen() {
    let code = generateGameCode();
    iAmHost = true;
    document.getElementById('selection-screen').classList.add('d-none');
    document.getElementById('host-screen').classList.remove('d-none');
    document.getElementById('game-code').textContent = code;
    lobbyId = `https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/lobby/${code}`
    client.subscribe(lobbyId, (err) => {
        if (!err) {

        }
    });
}

function unsubscribe(topic) {
    try {
        client.unsubscribe(lobbyId, (err) => { });
    } catch (e) {
        console.log(e);
    }
}

function showJoinScreen() {
    iAmHost = false;
    document.getElementById('selection-screen').classList.add('d-none');
    document.getElementById('join-screen').classList.remove('d-none');
}

function backToSelection() {
    iAmHost = false;
    document.getElementById('selection-screen').classList.remove('d-none');
    document.getElementById('host-screen').classList.add('d-none');
    document.getElementById('join-screen').classList.add('d-none');
    document.getElementById('game-screen').classList.add('d-none');
    unsubscribe(lobbyId);
    unsubscribe(clientIdListenTopic);
    resetGame();
}

function joinGame() {
    const code = document.getElementById('code-input').value;
    if (code.length === 6) {
        // document.getElementById('join-screen').classList.add('d-none');
        // document.getElementById('game-screen').classList.remove('d-none');
        lobbyId = `https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/lobby/${code}`
        let offset = Math.random().toString(16).substr(2, 8);
        clientIdListenTopic = `https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/user/${clientIdentifier}/offset/${offset}`;
        console.log(clientIdListenTopic);
        client.subscribe(clientIdListenTopic, (err) => { });
        client.publish(lobbyId, JSON.stringify({ type: MqttProtocols.JOIN, clientId: clientIdentifier, offset: offset }));
    }
}

function makeMove(index) {
    if (gameBoard[index] === '' && gameActive) {
        gameBoard[index] = currentPlayer;
        document.getElementsByClassName('game-cell')[index].textContent = currentPlayer;

        if (checkWin()) {
            document.getElementById('game-status').textContent = `Player ${currentPlayer} wins!`;
            gameActive = false;
            return;
        }

        if (gameBoard.every(cell => cell !== '')) {
            document.getElementById('game-status').textContent = "It's a draw!";
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        document.getElementById('game-status').textContent = `Current turn: ${currentPlayer}`;
    }
}

function checkWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return gameBoard[a] &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[a] === gameBoard[c];
    });
}

function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    document.getElementById('game-status').textContent = `Your turn (X)`;
    Array.from(document.getElementsByClassName('game-cell')).forEach(cell => {
        cell.textContent = '';
    });
}