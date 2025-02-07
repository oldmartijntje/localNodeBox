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
let iAmHost = false;
let gameState;
let lastServerMessage;
let clientHandshakeCompleted = false;
const restartButton = document.getElementById('restartButton');
restartButton.disabled = true;
restartButton.style.display = 'none';

// client.on('message', (topic, message) => {
//     const msg = message.toString();
//     receiveMessage(topic, msg);
// });

// client.publish(sendingPingRequestURL, JSON.stringify({ userId: settings.userId }));

let startingPlayer = ['X', 'O'][Math.floor(Math.random() * 2)];
let currentPlayer = startingPlayer;
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let mySymbol;

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

    isMyTurn = currentPlayer === mySymbol;
    showWaitingOverlay(!isMyTurn);
    document.getElementById('game-status').textContent = isMyTurn ?
        `Your turn (${mySymbol})` :
        `Waiting for opponent (${mySymbol === 'X' ? 'O' : 'X'})`;
}

function restartGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    startingPlayer = ['X', 'O'][Math.floor(Math.random() * 2)];
    currentPlayer = startingPlayer;
    gameState = {
        gameBoard: gameBoard,
        currentPlayer: currentPlayer,
        gameActive: gameActive,
        startingPlayer: startingPlayer
    };
    for (let clientId in clientConnections) {
        clientConnections[clientId].lastMessageSent = Date.now();
        client.publish(clientConnections[clientId].privateTopic, JSON.stringify({ type: MqttProtocols.GAME_STATE, gameState: gameState, messageFromServer: true }));
    }
    if (currentPlayer === mySymbol) {
        showWaitingOverlay(false);
        document.getElementById('game-status').textContent = `Your turn (${mySymbol})`;
    } else {
        showWaitingOverlay(true);
        document.getElementById('game-status').textContent = `Waiting for opponent (${mySymbol === 'X' ? 'O' : 'X'})`;
    }
    for (let i = 0; i < gameBoard.length; i++) {
        document.getElementsByClassName('game-cell')[i].textContent = gameBoard[i];
    }

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
    console.log(`Listening to topic ${lobbyId}`);
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
                    privateTopic: `${Math.random().toString(16).substr(2, 8)}/https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/user/${formatted.clientId}/offset/${formatted.offset}/lobby/${lobbyId}`,
                    lastMessageSent: Date.now(),
                    lastMessageReceived: Date.now(),
                }
                client.subscribe(clientConnections[formatted.clientId].privateTopic, (err) => { });
                console.log(`Listening to topic ${clientConnections[formatted.clientId].privateTopic}`);
                client.publish(`${formatted.offset}/https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/user/${formatted.clientId}`, JSON.stringify({ type: MqttProtocols.SWITCHING_PROTOCOLS, privateTopic: clientConnections[formatted.clientId].privateTopic }));
            } else {
                client.publish(`${formatted.offset}/https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/user/${formatted.clientId}`, JSON.stringify({ type: MqttProtocols.FULL_LOBBY }));
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
        } else if (formatted.type === MqttProtocols.GAME_STATE && !formatted.messageFromServer) {
            if (gameState === null) {
                return;
            }
            if (gameBoard[formatted.gameState.clickedIndex] === '') {
                gameBoard[formatted.gameState.clickedIndex] = currentPlayer;
                document.getElementsByClassName('game-cell')[formatted.gameState.clickedIndex].textContent = currentPlayer;
                if (checkWin() != "") {
                    showWaitingOverlay(false);
                    document.getElementById('game-status').textContent = `Player ${checkWin()} wins!`;
                    gameActive = false;
                    for (let clientId in clientConnections) {
                        client.publish(clientConnections[clientId].privateTopic, JSON.stringify({ type: MqttProtocols.GAME_STATE, gameState: gameState, messageFromServer: true }));
                    }
                    return
                }
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                showWaitingOverlay(false);
                document.getElementById('game-status').textContent = `Your turn (${mySymbol})`;
            } else {
                for (let clientId in clientConnections) {
                    if (topic === clientConnections[clientId].privateTopic) {
                        clientConnections[clientId].lastMessageReceived = Date.now();
                        clientConnections[clientId].lastMessageSent = Date.now();
                        client.publish(clientConnections[clientId].privateTopic, JSON.stringify({ type: MqttProtocols.GAME_STATE, gameState: gameState, messageFromServer: true }));
                    }
                }
            }
        }
    } else if (!iAmHost) {
        if (formatted.type === MqttProtocols.SWITCHING_PROTOCOLS) {
            if (clientHandshakeCompleted) {
                return;
            }
            clientHandshakeCompleted = true;
            lastServerMessage = Date.now();
            unsubscribe(topic);
            lobbyId = formatted.privateTopic;
            client.subscribe(lobbyId, (err) => { });
            console.log(`Listening to topic ${lobbyId}`);
            client.publish(lobbyId, JSON.stringify({ type: MqttProtocols.OK, messageFromServer: false }));
        } else if (formatted.type === MqttProtocols.GAME_STATE && formatted.messageFromServer) {
            lastServerMessage = Date.now();
            gameBoard = formatted.gameState.gameBoard;
            currentPlayer = formatted.gameState.currentPlayer;
            gameActive = formatted.gameState.gameActive;
            startingPlayer = formatted.gameState.startingPlayer;
            initializeGame(false);
            if (currentPlayer == mySymbol) {
                showWaitingOverlay(false);
                document.getElementById('game-status').textContent = `Your turn (${mySymbol})`;
            } else {
                showWaitingOverlay(true);
                document.getElementById('game-status').textContent = `Waiting for opponent (${mySymbol === 'X' ? 'O' : 'X'})`;
            }
            for (let i = 0; i < gameBoard.length; i++) {
                document.getElementsByClassName('game-cell')[i].textContent = gameBoard[i];
            }
            if (checkWin() != "") {
                document.getElementById('game-status').textContent = `Player ${checkWin()} wins!`;
                showWaitingOverlay(false);
                gameActive = false;
            }
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
    startingPlayer = ['X', 'O'][Math.floor(Math.random() * 2)];
    currentPlayer = startingPlayer;
    document.getElementById('selection-screen').classList.add('d-none');
    document.getElementById('host-screen').classList.remove('d-none');
    document.getElementById('game-code').textContent = code;
    lobbyId = `https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/lobby/${code}`
    client.subscribe(lobbyId, (err) => { });
    console.log(`Listening to topic ${lobbyId}`);
    restartButton.disabled = false;
    restartButton.style.display = 'block';
}

function unsubscribe(topic) {
    if (topic) {
        return;
    }
    try {
        client.unsubscribe(lobbyId, (err) => { });
    } catch (e) {
        console.warn(`couldn't unsubscrib from ${topic}`);
    }
}

function showJoinScreen() {
    iAmHost = false;
    document.getElementById('selection-screen').classList.add('d-none');
    document.getElementById('join-screen').classList.remove('d-none');
    restartButton.disabled = true;
    restartButton.style.display = 'none';
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
    clientHandshakeCompleted = false;
    lobbyId = null;
}

function joinGame() {
    const code = document.getElementById('code-input').value;
    if (code.length === 6) {
        lobbyId = `https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/lobby/${code}`
        let offset = Math.random().toString(16).substr(2, 8);
        clientIdListenTopic = `${offset}/https://oldmartijntje.github.io/misc/mqttLobby/tic-tac-toe/user/${clientIdentifier}`;
        client.subscribe(clientIdListenTopic, (err) => { });
        console.log(`Listening to topic ${clientIdListenTopic}`);
        client.publish(lobbyId, JSON.stringify({ type: MqttProtocols.JOIN, clientId: clientIdentifier, offset: offset }));
    }
}

function makeMove(index) {
    if (gameBoard[index] === '' && gameActive) {
        if (mySymbol !== currentPlayer) {
            return;
        }
        gameBoard[index] = currentPlayer;
        document.getElementsByClassName('game-cell')[index].textContent = currentPlayer;
        gameState = {
            gameBoard: gameBoard,
            currentPlayer: currentPlayer,
            gameActive: gameActive,
            startingPlayer: startingPlayer,
            clickedIndex: index
        };
        if (iAmHost) {
            if (checkWin() != "") {
                document.getElementById('game-status').textContent = `Player ${currentPlayer} wins!`;
                gameActive = false;
                for (let clientId in clientConnections) {
                    client.publish(clientConnections[clientId].privateTopic, JSON.stringify({ type: MqttProtocols.GAME_STATE, gameState: gameState, messageFromServer: true }));
                }
                return;
            }
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            gameState.currentPlayer = currentPlayer;
            for (let clientId in clientConnections) {
                client.publish(clientConnections[clientId].privateTopic, JSON.stringify({ type: MqttProtocols.GAME_STATE, gameState: gameState, messageFromServer: true }));
            }
        } else {
            client.publish(lobbyId, JSON.stringify({ type: MqttProtocols.GAME_STATE, gameState: gameState, messageFromServer: false }));
        }
        showWaitingOverlay(true);
        // if (checkWin()) {
        //     document.getElementById('game-status').textContent = `Player ${currentPlayer} wins!`;
        //     gameActive = false;
        //     return;
        // }

        // if (gameBoard.every(cell => cell !== '')) {
        //     document.getElementById('game-status').textContent = "It's a draw!";
        //     gameActive = false;
        //     return;
        // }
        document.getElementById('game-status').textContent = `Current turn: ${currentPlayer}`;
    }
}

function checkWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    // return either "", "X", or "O"
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return gameBoard[a];
        }
    }
    return "";

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
            client.publish(clientConnections[clientId].privateTopic, JSON.stringify({ type: MqttProtocols.QUIT, messageFromServer: true }));
        }
    } else {
        client.publish(lobbyId, JSON.stringify({ type: MqttProtocols.QUIT, messageFromServer: false }));
    }
    clientConnections = {};
    maxClients = 1;
    lobbyId = null;
    clientIdListenTopic = null;
    iAmHost = false;
    gameState = null;
    startingPlayer = ['X', 'O'][Math.floor(Math.random() * 2)];
    clientHandshakeCompleted = false;
}