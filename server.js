const mqtt = require('mqtt');
const fs = require('fs');

// Load the credentials from config.json
const config = require('./config.json');

// Scan duration setting
const scanDuration = 60 * 1000; // 1 minute

// File to store the results
const outputFile = 'mqtt_scan_results.json';

// Store only the received data/messages
let capturedMessages = [];

// Function to save received messages to a JSON file
function saveResults() {
    fs.writeFile(outputFile, JSON.stringify(capturedMessages, null, 2), (err) => {
        if (err) {
            console.error('Error writing results to file:', err);
        } else {
            console.log(`Results saved to ${outputFile}`);
        }
    });
}

// Function to attempt connection to MQTT (standard)
function scanMQTT() {
    const url = `mqtt://${config.host}:${config.port}`;
    const options = {
        username: config.username,
        password: config.password,
    };

    const client = mqtt.connect(url, options);

    client.on('connect', () => {
        console.log('Connected to MQTT broker (standard)');

        // Subscribe to all topics
        client.subscribe('#', (err) => {
            capturedMessages.push({ protocol: 'MQTT', message: "connection made", time: new Date() });
            if (err) {
                console.error('Subscription error:', err);
            }
        });

        // Handle incoming messages
        client.on('message', (topic, message) => {
            console.log(`Message received (MQTT): Topic = ${topic}, Message = ${message.toString()}`);
            capturedMessages.push({ protocol: 'MQTT', topic: topic, message: message.toString(), time: new Date() });
        });
    });

    client.on('error', (err) => {
        console.error('Error (standard MQTT):', err.message);
    });

    // Disconnect after the scan duration
    setTimeout(() => {
        client.end();
        console.log('MQTT scan (standard) completed');
    }, scanDuration);
}

// Function to attempt connection to MQTT over WebSocket
function scanMQTTWebSocket() {
    const url = `ws://${config.host}:${config.port}/mqtt`;
    const options = {
        username: config.username,
        password: config.password,
    };

    const client = mqtt.connect(url, options);

    client.on('connect', () => {
        console.log('Connected to MQTT broker (WebSocket)');

        // Subscribe to all topics
        client.subscribe('#', (err) => {
            if (err) {
                console.error('Subscription error (WebSocket):', err);
            }
        });

        // Handle incoming messages
        client.on('message', (topic, message) => {
            console.log(`Message received (WebSocket): Topic = ${topic}, Message = ${message.toString()}`);
            capturedMessages.push({ protocol: 'WebSocket', topic: topic, message: message.toString(), time: new Date() });
        });
    });

    client.on('error', (err) => {
        console.error('Error (WebSocket):', err.message);
    });

    // Disconnect after the scan duration
    setTimeout(() => {
        client.end();
        console.log('MQTT scan (WebSocket) completed');
    }, scanDuration);
}

// Start scanning both protocols
console.log(`Starting MQTT scan for ${scanDuration / 1000} seconds...`);
scanMQTT();
scanMQTTWebSocket();

// Save results after scan duration
setTimeout(() => {
    saveResults();
}, scanDuration + 1000);
