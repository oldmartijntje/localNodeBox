const mqtt = require('mqtt');
const fs = require('fs');

// Load the credentials from config.json
const config = require('./config.json');

// Scan duration setting
const scanDuration = 60 * 1000; // 1 minute

// File to store the results
const outputFile = 'mqtt_scan_results.json';

// Store received data/messages and log events
let capturedMessages = [];
let hasLoggedConnectionError = false;

// Function to save log events and messages to a JSON file
function saveResults() {
    fs.writeFile(outputFile, JSON.stringify(capturedMessages, null, 2), (err) => {
        if (err) {
            console.error('Error writing results to file:', err);
        } else {
            console.log(`Results saved to ${outputFile}`);
        }
    });
}

// Log an event to the JSON file
function logEvent(eventType, details) {
    const eventLog = {
        event: eventType,
        details: details || {},
        time: new Date()
    };
    capturedMessages.push(eventLog);
    console.log(`${eventType}: ${JSON.stringify(details)}`);
}

// Function to dynamically construct the URL based on `ignorePort` setting
function constructUrl(protocol) {
    if (config.ignorePort) {
        return `${protocol}://${config.host}`;
    }
    return `${protocol}://${config.host}:${config.port}`;
}

// Function to create the connection options based on `useCredentials` setting
function getConnectionOptions() {
    if (config.useCredentials) {
        return {
            username: config.username,
            password: config.password,
            qos: 1
        };
    }
    return { qos: 1 }; // No authentication
}

// Function to attempt connection to MQTT (standard) and send a message on connect
function scanMQTT() {
    const url = constructUrl('mqtt');
    const options = getConnectionOptions();

    const client = mqtt.connect(url, options);

    logEvent('scan_start', { protocol: 'MQTT', url });

    client.on('connect', () => {
        logEvent('connected', { protocol: 'MQTT', url });
        hasLoggedConnectionError = false;

        // Subscribe to all topics
        client.subscribe('#', { qos: 1 }, (err) => {
            if (err) {
                logEvent('subscription_error', { error: err.message });
            } else {
                logEvent('subscribed', { topic: '#' });
            }
        });

        // Send a test message after connecting to check write access
        const testTopic = 'test/message';
        const testMessage = 'Hello from MQTT client';
        client.publish(testTopic, testMessage, { qos: 1 }, (err) => {
            if (err) {
                logEvent('publish_error', { error: err.message });
            } else {
                logEvent('message_sent', { topic: testTopic, message: testMessage });
            }
        });

        // Handle incoming messages
        client.on('message', (topic, message) => {
            logEvent('message_received', { topic: topic, message: message.toString() });
        });
    });

    client.on('error', (err) => {
        if (!hasLoggedConnectionError) {
            logEvent('connection_error', { error: err.message });
            hasLoggedConnectionError = true;
        }
    });

    // Disconnect after the scan duration
    setTimeout(() => {
        client.end();
        logEvent('scan_completed', { protocol: 'MQTT' });
    }, scanDuration);
}

// Function to attempt connection to MQTT over WebSocket and send a message on connect
function scanMQTTWebSocket() {
    const url = constructUrl('ws');
    const options = getConnectionOptions();

    const client = mqtt.connect(url, options);

    logEvent('scan_start', { protocol: 'WebSocket', url });

    client.on('connect', () => {
        logEvent('connected', { protocol: 'WebSocket', url });
        hasLoggedConnectionError = false;

        // Subscribe to all topics
        client.subscribe('#', { qos: 1 }, (err) => {
            if (err) {
                logEvent('subscription_error', { error: err.message });
            } else {
                logEvent('subscribed', { topic: '#' });
            }
        });

        // Send a test message after connecting to check write access
        const testTopic = 'test/message';
        const testMessage = 'Hello from MQTT client (WebSocket)';
        client.publish(testTopic, testMessage, { qos: 1 }, (err) => {
            if (err) {
                logEvent('publish_error', { error: err.message });
            } else {
                logEvent('message_sent', { topic: testTopic, message: testMessage });
            }
        });

        // Handle incoming messages
        client.on('message', (topic, message) => {
            logEvent('message_received', { topic: topic, message: message.toString() });
        });
    });

    client.on('error', (err) => {
        if (!hasLoggedConnectionError) {
            logEvent('connection_error', { error: err.message });
            hasLoggedConnectionError = true;
        }
    });

    // Disconnect after the scan duration
    setTimeout(() => {
        client.end();
        logEvent('scan_completed', { protocol: 'WebSocket' });
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
