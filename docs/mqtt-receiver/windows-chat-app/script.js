
const overlay = document.querySelector('.overlay');
const usernameInput = document.getElementById('username');
const okButton = document.querySelector('.dialog-content button');
const closeButton = document.querySelector('.dialog-title button');
const usernameEditButton = document.querySelector('.info-area button');

const localSettings = localStorage.getItem('mqtt-windows95-settings');
let settings = localSettings ? JSON.parse(localSettings) : {
    username: '',
};
let enteredUsername = false;
let testMessage = {
    username: 'test',
    message: 'test message',
    time: new Date().toLocaleTimeString(),
}
let testPing = {
    username: 'test',
    message: 'ping',
    biography: 'ping',
    time: new Date().toLocaleTimeString(),
}

if (settings.username && settings.username.trim() !== '') {
    overlay.style.display = 'none';
    enteredUsername = true;
    setUsernameLabel()
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
        localStorage.setItem('mqtt-windows95-settings', JSON.stringify(settings));
        enteredUsername = true;
        setUsernameLabel();
    } else {
        alert('Please enter a username');
    }
});

function setUsernameLabel() {
    const usernameLabel = document.getElementById('username-field');
    usernameLabel.textContent = settings.username;
}