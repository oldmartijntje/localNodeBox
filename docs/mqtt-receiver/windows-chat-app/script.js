const overlay = document.querySelector('.overlay');
const usernameInput = document.getElementById('username');
const okButton = document.querySelector('.dialog-content button');
const closeButton = document.querySelector('.dialog-title button');
const usernameEditButton = document.querySelector('.info-area button');
const contactsArea = document.querySelector('.contacts-area');
const defaultSettings = {
    username: '',
    userId: generateUUID(),	
    chatHistory: {},
    activeContacts: {},
    rememberedContacts: {},
    blockedUuids: [],
};
const statusTypes = {
    0: '', // offline
    1: '🟡', // AFK
    2: '🟢', // online
    3: '🔴', // unused
}

const localSettings = localStorage.getItem('mqtt-windows95-settings');
const pingURL = `${window.location.href}/ping`;
let settings = localSettings ? JSON.parse(localSettings) : JSON.parse(JSON.stringify(defaultSettings));
compareSettings();
const pingRequestURL = `${window.location.href}/${settings.userId}/pingRequest`;

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
    client.subscribe(`${window.location.href}/${settings.userId}`, (err) => {
        if (!err) {
            console.log(`Subscribed to: ${window.location.href}/${settings.userId}`);
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
    for (const key of Object.keys(settings.activeContacts)) {
        settings.activeContacts[key].status = 0;
    }

    if (Object.keys(settings.activeContacts).length > 0) {
        renderContacts();
    }
    for (const key of Object.keys(settings.activeContacts)) {
        const sendingPingRequestURL = `${window.location.href}/${key}/pingRequest`;
        client.publish(sendingPingRequestURL, JSON.stringify({ userId: settings.userId }));
    }
}

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
        settings.username = username.split(' ').join('_');
        console.log(`Username set to: ${username}`);
        overlay.style.display = 'none';
        enteredUsername = true;
        setUsernameLabel();
    } else {
        alert('Please enter a username');
    }
});

setInterval(() => {
    sendPing();
}, 10000); // 10 seconds

setInterval(() => {
    let changed = false;
    for (const [key, value] of Object.entries(settings.activeContacts)) {
        if (value.time + 60000 < Date.now()) {
            // 1 minute inactivity
            if (value.status == 2) {
                value.status = 1;
                changed = true;
            } else if (value.status == 1 && value.time + 300000 < Date.now()) {
                // 5 ,minutes inactivity
                // delete settings.activeContacts[key];
                value.status = 0;
                changed = true;
            }
        }
    }    
    localStorage.setItem('mqtt-windows95-settings', JSON.stringify(settings));
    if (changed) {
        renderContacts();
    }
}, 60000); // 1 minute

function renderContacts() {
    // sort by last active
    const contacts = Object.values(settings.activeContacts).sort((a, b) => b.status - a.status);
    contactsArea.innerHTML = '';
    contacts.forEach(contact => {
        const contactElement = document.createElement('div');
        contactElement.classList.add('contact');
        contactElement.innerHTML = ` <div class="contact">${statusTypes[contact.status ? contact.status : 0]}${contact.username}</div>`;
        contactsArea.appendChild(contactElement);
    });
}

function pingedByUser(messageJson) {
    if (messageJson.userId === settings.userId || !messageJson.username || !messageJson.time || !messageJson.userId) {
        return;
    }
    if (settings.activeContacts.length === 0) {
        settings.activeContacts[messageJson.userId] = {
            username: messageJson.username,
            time: Date.now(),
            status: 2,
        };
    } else {
        if (!settings.activeContacts[messageJson.userId]) {
            settings.activeContacts[messageJson.userId] = {
                username: messageJson.username,
                time: Date.now(),
                status: 2,
            };
        } else {
            settings.activeContacts[messageJson.userId].time = Date.now();
            settings.activeContacts[messageJson.userId].status = 2;
            settings.activeContacts[messageJson.userId].username = messageJson.username;
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
    if (topic === `${window.location.href}/${settings.userId}`) {
        console.log(`Received message: ${msg} from topic: ${topic}`);
    } else if (topic === pingURL) {
        pingedByUser(msg);
    } else if (topic === pingRequestURL) {
        if (msg.userId === settings.userId || !msg.userId || settings.blockedUuids.includes(msg.userId)) {
            return;
        }
        sendPing();
    }
}

function sendPing() {
    const pingDesign = testPing;
    pingDesign.userId = settings.userId;
    pingDesign.username = settings.username;
    pingDesign.time = new Date().toLocaleTimeString();
    client.publish(pingURL, JSON.stringify(pingDesign));
}

function setUsernameLabel() {
    const usernameLabel = document.getElementById('username-field');
    usernameLabel.textContent = settings.username;
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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}