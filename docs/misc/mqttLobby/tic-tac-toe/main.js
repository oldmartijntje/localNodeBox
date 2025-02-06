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
    static QUIT = '205 Reset Content';
    static KICK = '403 Forbidden';
    static BAN = '401 Unauthorized';
}

let lobbyId;
let clientIdListenTopic;
let clientConnections = {};
let maxClients = 1;
let clientIdentifier = Math.random().toString(16).substr(2, 8);
console.log(clientIdentifier);
let iAmHost = false;
let gameState;
let lastServerMessage;

// client.on('message', (topic, message) => {
//     const msg = message.toString();
//     receiveMessage(topic, msg);
// });

// client.publish(sendingPingRequestURL, JSON.stringify({ userId: settings.userId }));

let startingPlayer = ['X', 'O'][Math.floor(Math.random() * 2)];
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

checkForDisconnects()

function showWaitingOverlay(show) {
    const overlay = document.querySelector('.waiting-overlay');
    overlay.style.display = show ? 'flex' : 'none';
    isMyTurn = !show;
}

function checkForDisconnects() {
    const now = Date.now();
    if (iAmHost) {
        for (let clientId in clientConnections) {
            if (now - clientConnections[clientId].lastMessageReceived > 60000) {
                // longer than 60 seconds since last message
                cleanupLobby();
                backToSelection();
                return;
            } else if (now - clientConnections[clientId].lastMessageReceived > 10000) {
                clientConnections[clientId].lastMessageSent = now;
                client.publish(clientConnections[clientId].privateTopic, JSON.stringify({ type: MqttProtocols.PING, messageFromServer: true, moment: now }));
            }
        }
    } else if (lobbyId != null && lastServerMessage != null) {
        if (now - lastServerMessage > 60000) {
            cleanupLobby();
            backToSelection();
            return;
        } else if (now - lastServerMessage > 10000) {
            client.publish(lobbyId, JSON.stringify({ type: MqttProtocols.PING, messageFromServer: false, moment: now }));
        }
    }
    setTimeout(checkForDisconnects, 10000);
}


function initializeGame(asHost) {
    document.getElementById('join-screen').classList.add('d-none');
    document.getElementById('host-screen').classList.add('d-none');
    document.getElementById('game-screen').classList.remove('d-none');
    mySymbol = asHost ? 'X' : 'O';
    isMyTurn = startingPlayer === mySymbol;
    showWaitingOverlay(!isMyTurn);
    document.getElementById('game-status').textContent = isMyTurn ?
        `Your turn (${mySymbol})` :
        `Waiting for opponent (${mySymbol === 'X' ? 'O' : 'X'})`;
}

// Modify the showHostScreen function
function showHostScreen() {
    let code = generateGameCode();
    iAmHost = true;
    document.getElementById('selection-screen').classList.add('d-none');
    document.getElementById('host-screen').classList.remove('d-none');
    document.getElementById('game-code').textContent = code;
    lobbyId = `https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/lobby/${code}`;
    client.subscribe(lobbyId, (err) => { });
}

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
    if (formatted.type === MqttProtocols.QUIT) {
        // in this game we should also leave the lobby
        // in other games you'd just clean up the clientConnections object
        cleanupLobby(topic);
        backToSelection();
    } else if (iAmHost) {
        if (formatted.type === MqttProtocols.JOIN) {
            if (Object.keys(clientConnections).length < maxClients) {
                clientConnections[formatted.clientId] = {
                    privateTopic: `https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/user/${formatted.clientId}/offset/${formatted.offset}/lobby/${lobbyId}/offset/${Math.random().toString(16).substr(2, 8)}`,
                    lastMessageSent: Date.now(),
                    lastMessageReceived: Date.now(),
                }
                client.subscribe(clientConnections[formatted.clientId].privateTopic, (err) => { });
                client.publish(`https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/user/${formatted.clientId}/offset/${formatted.offset}`, JSON.stringify({ type: MqttProtocols.SWITCHING_PROTOCOLS, privateTopic: clientConnections[formatted.clientId].privateTopic }));
            } else {
                client.publish(`https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/user/${formatted.clientId}/offset/${formatted.offset}`, JSON.stringify({ type: MqttProtocols.FULL_LOBBY }));
            }
        } else if (formatted.type === MqttProtocols.OK) {
            initializeGame(true)
            gameState = {
                gameBoard: gameBoard,
                currentPlayer: currentPlayer,
                gameActive: gameActive,
                startingPlayer: startingPlayer
            };
            for (let clientId in clientConnections) {
                if (topic === clientConnections[clientId].privateTopic) {
                    clientConnections[clientId].lastMessageReceived = Date.now();
                    clientConnections[clientId].lastMessageSent = Date.now();
                    client.publish(clientConnections[clientId].privateTopic, JSON.stringify({ type: MqttProtocols.GAME_STATE, gameState: gameState, messageFromServer: true }));
                }
            }
        } else if (formatted.type === MqttProtocols.PONG && !formatted.messageFromServer) {
            if (formatted.moment < lastServerMessage - 10000) {
                return;
            }
            for (let clientId in clientConnections) {
                if (topic === clientConnections[clientId].privateTopic) {
                    clientConnections[clientId].lastMessageReceived = Date.now();
                }
            }
        } else if (formatted.type === MqttProtocols.PING && !formatted.messageFromServer) {
            if (formatted.moment > lastServerMessage - 10000) {
                client.publish(topic, JSON.stringify({ type: MqttProtocols.PONG, messageFromServer: true, moment: Date.now() }));
            }
        }
    } else if (!iAmHost) {
        if (formatted.type === MqttProtocols.SWITCHING_PROTOCOLS) {
            lastServerMessage = Date.now();
            unsubscribe(topic);
            lobbyId = formatted.privateTopic;
            client.subscribe(lobbyId, (err) => { });
            client.publish(lobbyId, JSON.stringify({ type: MqttProtocols.OK, messageFromServer: false }));
        } else if (formatted.type === MqttProtocols.GAME_STATE && formatted.messageFromServer) {
            lastServerMessage = Date.now();
            gameBoard = formatted.gameState.gameBoard;
            currentPlayer = formatted.gameState.currentPlayer;
            gameActive = formatted.gameState.gameActive;
            startingPlayer = formatted.gameState.startingPlayer;
            initializeGame(false);
        } else if (formatted.type === MqttProtocols.PING && formatted.messageFromServer) {
            lastServerMessage = Date.now();
            if (formatted.moment > lastServerMessage - 10000) {
                client.publish(topic, JSON.stringify({ type: MqttProtocols.PONG, messageFromServer: false, moment: Date.now() }));
            }
        } else if (formatted.type === MqttProtocols.PONG && formatted.messageFromServer) {
            if (formatted.moment < lastServerMessage - 10000) {
                return;
            }
            lastServerMessage = Date.now();
        }
    } else {
        client.publish(topic, JSON.stringify({ type: MqttProtocols.INVALID }));
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
    if (topic) {
        return;
    }
    try {
        client.unsubscribe(lobbyId, (err) => { });
    } catch (e) {
        console.warn(`couldn't unsubscrib from ${topic}`);
        // console.log(e);
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
    lobbyId = null;
}

function joinGame() {
    const code = document.getElementById('code-input').value;
    if (code.length === 6) {
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

function cleanupLobby(topic = "") {
    unsubscribe('#');
    // if (topic != "") {
    //     unsubscribe(topic);
    // }
    // unsubscribe(lobbyId);
    if (iAmHost) {
        for (let clientId in clientConnections) {
            // unsubscribe(clientConnections[clientId].privateTopic);
            client.publish(clientConnections[clientId].privateTopic, JSON.stringify({ type: MqttProtocols.QUIT }));
        }
    } else {
        client.publish(lobbyId, JSON.stringify({ type: MqttProtocols.QUIT }));
    }
    clientConnections = {};
    maxClients = 1;
    lobbyId = null;
    clientIdListenTopic = null;
    iAmHost = false;
    gameState = null;
    startingPlayer = ['X', 'O'][Math.floor(Math.random() * 2)];
}