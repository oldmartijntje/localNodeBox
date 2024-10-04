const overlay = document.querySelector('.overlay');
const usernameInput = document.getElementById('username');
const okButton = document.querySelector('.dialog-content button');
const closeButton = document.querySelector('.dialog-title button');
const usernameEditButton = document.querySelector('.info-area button');
const contactsArea = document.querySelector('.contacts-area');
const sendMessageButton = document.querySelector('.input-area button');
const messageInput = document.querySelector('.input-area input');
const defaultSettings = {
    username: '',
    userId: generateUUID(),
    chatHistory: {},
    activeContacts: {},
    chatRooms: {
        'HARD_CODED_CHATROOM': {
            username: 'Chat Room',
            time: Date.now(),
            status: 4,
            messages: [],
            identifier: 'HARD_CODED_CHATROOM',
            chatroom: true,
        }
    },
    blockedUuids: [],
    frequencyUsed: false ? `${window.location.href}` : `https://oldmartijntje.github.io/localNodeBox/mqtt-receiver/windows-chat-app/`
};
const statusTypes = {
    0: '', // offline
    1: '🟡', // AFK
    2: '🟢', // online
    3: '🔴', // unused
    4: '🔵', // chatroom
};

let activeChatId = 'HARD_CODED_CHATROOM';


const localSettings = localStorage.getItem('mqtt-windows95-settings');
let settings = localSettings ? JSON.parse(localSettings) : JSON.parse(JSON.stringify(defaultSettings));
compareSettings();
const pingURL = `${settings.frequencyUsed}/ping`;
const pingRequestURL = `${settings.frequencyUsed}/${settings.userId}/pingRequest`;

let enteredUsername = false;
let testMessage = {
    username: 'test',
    message: 'test message',
    time: new Date().toLocaleTimeString(),
    userId: 'uuid',
    channelId: 'uuid',
}
let testPing = {
    username: 'test',
    message: '',
    biography: '',
    userId: 'uuid',
    time: new Date().toLocaleTimeString(),
}

const client = mqtt.connect('wss://test.mosquitto.org:8081');
client.on('connect', () => {
    client.subscribe(`${settings.frequencyUsed}/${settings.userId}`, (err) => {
        if (!err) {
            console.log(`Subscribed to: ${settings.frequencyUsed}/${settings.userId}`);
        }
    });
    client.subscribe(pingRequestURL, (err) => {
        if (!err) {
            console.log(`Subscribed to: ${pingRequestURL}`);
        }
    });
    client.subscribe(pingURL, (err) => {
        if (!err) {
            console.log(`Subscribed to: ${pingURL}`);
        }
    });
});

client.on('message', (topic, message) => {
    const msg = message.toString();
    receiveMessage(topic, msg);
});

console.log(settings)
if (settings.username && settings.username.trim() !== '') {
    overlay.style.display = 'none';
    enteredUsername = true;
    setUsernameLabel();
}
ckeckChatStatus();
for (const key of Object.keys(settings.activeContacts)) {
    const sendingPingRequestURL = `${settings.frequencyUsed}/${key}/pingRequest`;
    client.publish(sendingPingRequestURL, JSON.stringify({ userId: settings.userId }));
}
renderContacts();
selectChat(activeChatId);

usernameEditButton.addEventListener('click', () => {
    overlay.style.display = 'flex';
    usernameInput.value = settings.username;
});

closeButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    if (!enteredUsername) {
        setTimeout(() => {
            overlay.style.display = 'flex';
        }, 100);
    }
});

okButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        settings.username = replaceAllNoneAlphaNumeric(username.split(' ').join('_'));
        console.log(`Username set to: ${username}`);
        overlay.style.display = 'none';
        enteredUsername = true;
        setUsernameLabel();
    } else {
        alert('Please enter a username');
    }
});

sendMessageButton.addEventListener('click', () => {
    const message = replaceAllNoneAlphaNumeric(messageInput.value.trim(), true);
    if (message) {
        messageInput.value = '';
        const messageDesign = JSON.parse(JSON.stringify(testMessage));
        messageDesign.message = message;
        messageDesign.username = settings.username;
        messageDesign.time = `${new Date()}`;
        const allChgats = { ...settings.activeContacts, ...settings.chatRooms };
        messageDesign.userId = settings.userId;
        if (allChgats[activeChatId].chatroom) {
            messageDesign.channelId = activeChatId;
            for (const [key, value] of Object.entries(settings.activeContacts)) {
                if (key === settings.userId) {
                    continue;
                }
                console.log(`${settings.frequencyUsed}/${key}`, JSON.stringify(messageDesign))
                client.publish(`${settings.frequencyUsed}/${key}`, JSON.stringify(messageDesign));
            }
        } else {
            messageDesign.channelId = settings.userId;
            messageDesign.receiverId = activeChatId;
            client.publish(`${settings.frequencyUsed}/${activeChatId}`, JSON.stringify(messageDesign));
        }
        if (!settings.chatHistory[activeChatId]) {
            settings.chatHistory[activeChatId] = [];
        }
        settings.chatHistory[activeChatId].push({ username: settings.username, message, time: messageDesign.time, userId: settings.userId });
        localStorage.setItem('mqtt-windows95-settings', JSON.stringify(settings));
        selectChat(activeChatId);
        messageInput.value = '';
    }
});



setInterval(() => {
    sendPing();
}, 10000); // 10 seconds

setInterval(() => {
    ckeckChatStatus();
}, 10000); // 10 seconds

function ckeckChatStatus() {
    let changed = false;
    for (const [key, value] of Object.entries(settings.activeContacts)) {
        let changedThisId = false;
        const time = new Date(value.time).getTime();
        const now = new Date(Date.now()).getTime();
        if (time + 60000 < now) {
            // 1 minute inactivity
            if (value.status == 2) {
                value.status = 1;
                changed = true;
                changedThisId = true;
            } else if (value.status < 2 && time + 300000 < now) {
                // 5 ,minutes inactivity
                value.status = 0;
                changed = true;
                changedThisId = true;
                if ((!settings.chatHistory[value.identifier] || settings.chatHistory[value.identifier].length === 0) && time + 600000 < now) {
                    // 10 minutes of inactivity
                    settings.chatHistory[value.identifier] = [];
                    delete settings.activeContacts[key];
                    if (activeChatId === key) {
                        activeChatId = 'HARD_CODED_CHATROOM';
                        selectChat(activeChatId);
                    }
                }
            }
        }
        if (activeChatId === key && changedThisId) {
            selectChat(key);
        }
    }
    localStorage.setItem('mqtt-windows95-settings', JSON.stringify(settings));
    if (changed) {
        renderContacts();
    }
}

function replaceAllNoneAlphaNumeric(str, allowBraces = false) {
    str = str.toLowerCase();
    if (allowBraces) {
        return str.replace(/[^a-z0-9_\-\[\]\(\):\/\.\?&= ]/g, '¿');
    }
    return str.replace(/[^a-z0-9_-]/g, '¿');
}

function renderContacts() {
    // sort by last active
    const contacts = Object.values({ ...settings.activeContacts, ...settings.chatRooms }).sort((a, b) => b.status - a.status);
    contactsArea.innerHTML = '';
    contacts.forEach(contact => {
        if (settings.blockedUuids.includes(contact.userId)) {
            return;
        }
        const contactElement = document.createElement('div');
        contactElement.classList.add('contact');
        contactElement.innerHTML = ` <div class="contact">${statusTypes[contact.status ? contact.status : 0]}${contact.username}${contact.unReadMessages > 0 ? '🔔' : ''}</div>`;
        contactElement.addEventListener('click', () => {
            console.log(contact)
            if (contact.username) {
                selectChat(contact.identifier);
            }
        });

        contactsArea.appendChild(contactElement);
    });
}

function getLastActiveTime(identifier) {
    // x years ago
    // x months ago
    // x days ago
    // x hours ago
    // x minutes ago
    // afk
    // online

    const contact = { ...settings.activeContacts, ...settings.chatRooms }[identifier];
    if (contact.status == 2) {
        return 'online';
    } else if (contact.status == 1) {
        return 'AFK';
    } else if (contact.status == 0) {
        const timeDiff = Date.now() - contact.time;
        const seconds = timeDiff / 1000;
        if (seconds < 60) {
            return `last seen ${Math.floor(seconds)} seconds ago`;
        }
        const minutes = seconds / 60;
        if (minutes < 60) {
            return `last seen ${Math.floor(minutes)} minutes ago`;
        }
        const hours = minutes / 60;
        if (hours < 24) {
            return `last seen ${Math.floor(hours)} hours ago`;
        }
        const days = hours / 24;
        if (days < 30) {
            return `last seen ${Math.floor(days)} days ago`;
        }
        const months = days / 30.4;
        if (months < 12) {
            return `last seen ${Math.floor(months)} months ago`;
        }
        const years = months / 12;
        return `last seen ${Math.floor(years)} years ago`;
    }
}

function selectChat(chatId) {
    activeChatId = chatId;
    const chat = { ...settings.activeContacts, ...settings.chatRooms }[chatId];
    if (chat.unReadMessages > 0) { 
        chat.unReadMessages = 0;
        localStorage.setItem('mqtt-windows95-settings', JSON.stringify(settings));
        renderContacts();
    }
    const chatArea = document.querySelector('.chat-area');
    chatArea.innerHTML = '';
    const activeChatName = document.getElementById('active-chat-name');
    activeChatName.textContent = `${chat.username} ${!chat.chatroom ? ` - ${getLastActiveTime(chatId)}` : ''}`;
    if (settings.chatHistory[chat.identifier]) {
        settings.chatHistory[chat.identifier].forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.innerHTML = `<div class="message"><span class="time">${new Date(message.time).toLocaleTimeString()}</span> ${message.username}: ${message.message}</div>`;
            chatArea.appendChild(messageElement);
        });
    }
}

function pingedByUser(messageJson) {
    if (messageJson.userId === settings.userId || !messageJson.username || !messageJson.time || !messageJson.userId) {
        return;
    }
    if (settings.blockedUuids.includes(messageJson.userId)) {
        return;
    }
    if (messageJson.allContacts) {
        for (const [key, value] of Object.entries(messageJson.allContacts)) {
            if (settings.blockedUuids.includes(key) || key === settings.userId) {
                continue;
            }
            if (!settings.activeContacts[key]) {
                settings.activeContacts[key] = value;
            } else if (new Date(value.time).getTime() < new Date(settings.activeContacts[key].time).getTime()) {
                continue;
            } else {
                settings.activeContacts[key].time = value.time;
                settings.activeContacts[key].status = value.status;
                settings.activeContacts[key].username = value.username;
            }
        }
    }
    if (settings.activeContacts.length === 0) {
        settings.activeContacts[messageJson.userId] = {
            username: messageJson.username,
            time: messageJson.time,
            status: 2,
            unReadMessages: 0,
            identifier: messageJson.userId,
            chatroom: false,
        };
    } else {
        if (!settings.activeContacts[messageJson.userId]) {
            settings.activeContacts[messageJson.userId] = {
                username: messageJson.username,
                time: messageJson.time,
                status: 2,
                unReadMessages: 0,
                identifier: messageJson.userId,
                chatroom: false,
            };
        } else {
            settings.activeContacts[messageJson.userId].time = messageJson.time;
            const previousStatus = settings.activeContacts[messageJson.userId].status;
            const previousUsername = settings.activeContacts[messageJson.userId].username;
            settings.activeContacts[messageJson.userId].username = replaceAllNoneAlphaNumeric(messageJson.username);
            settings.activeContacts[messageJson.userId].status = 2;
            if (previousUsername !== messageJson.username && activeChatId === messageJson.userId) {
                selectChat(messageJson.userId);
            } else if (previousStatus !== 2 && activeChatId === messageJson.userId) {
                selectChat(messageJson.userId);
            }
        }
    }

    localStorage.setItem('mqtt-windows95-settings', JSON.stringify(settings));
    renderContacts()
}

function receiveMessage(topic, message) {
    // if un parsable as json, ignore
    let msg;
    try {
        msg = JSON.parse(message);
    } catch (e) {
        return;
    }
    if (topic === `${settings.frequencyUsed}/${settings.userId}`) {
        if (msg.userId === settings.userId || !msg.userId || settings.blockedUuids.includes(msg.userId)) {
            return;
        }
        if (settings.activeContacts[msg.channelId] && activeChatId !== msg.channelId) {
            settings.activeContacts[msg.channelId].unReadMessages = settings.activeContacts[msg.channelId].unReadMessages ? settings.activeContacts[msg.channelId].unReadMessages + 1 : 1;
        } else if (settings.chatRooms[msg.channelId] && activeChatId !== msg.channelId) {
            settings.chatRooms[msg.channelId].unReadMessages = settings.chatRooms[msg.channelId].unReadMessages ? settings.chatRooms[msg.channelId].unReadMessages + 1 : 1;
        }
        if (!settings.chatHistory[msg.channelId]) {
            settings.chatHistory[msg.channelId] = [];
        }
        settings.chatHistory[msg.channelId].push({ username: msg.username, message: msg.message, time: msg.time, userId: msg.userId });
        console.log(msg, settings.chatHistory[msg.channelId])
        localStorage.setItem('mqtt-windows95-settings', JSON.stringify(settings));
        if (activeChatId === msg.channelId) {
            selectChat(msg.userId);
        }
        renderContacts();
    } else if (topic === pingURL) {
        pingedByUser(msg);
    } else if (topic === pingRequestURL) {
        if (msg.userId === settings.userId || !msg.userId || settings.blockedUuids.includes(msg.userId)) {
            return;
        }
        sendPing(true);
    }
}

function sendPing(showContacts = false) {
    const pingDesign = JSON.parse(JSON.stringify(testPing));
    pingDesign.userId = settings.userId;
    pingDesign.username = replaceAllNoneAlphaNumeric(settings.username);
    if (showContacts) {
        pingDesign.allContacts = settings.activeContacts;
    }
    pingDesign.time = `${new Date()}`;
    client.publish(pingURL, JSON.stringify(pingDesign));
}

function setUsernameLabel() {
    const usernameLabel = document.getElementById('username-field');
    usernameLabel.textContent = replaceAllNoneAlphaNumeric(settings.username);
    localStorage.setItem('mqtt-windows95-settings', JSON.stringify(settings));
}

function compareSettings() {
    for (const key in defaultSettings) {
        if (settings[key] == undefined) {
            settings[key] = JSON.parse(JSON.stringify(defaultSettings))[key];
        }
    }
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}