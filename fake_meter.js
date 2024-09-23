const mqtt = require('mqtt');
const fs = require('fs');
const { format: formatDate } = require('date-fns');

// Read configuration
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Read topic and data
const topicSpam = JSON.parse(fs.readFileSync('topicSpam.json', 'utf8'));

// Construct the MQTT broker URL
const brokerUrl = `mqtt://${config.host}${!config.ignorePort ? `:${config.port}` : ''}`;

// Create MQTT client
const client = mqtt.connect(brokerUrl, {
    username: config.username,
    password: config.password,
    clientId: '2005-POK-EMON-V00-AAAAAA-AAAAAA',
});

// Function to update the date and time in the datagram
function updateDateTime(datagram) {
    const now = new Date();
    const formattedDate = formatDate(now, "yyMMddHHmmss") + "S";

    // Update the main timestamp
    datagram = datagram.replace(/0-0:1\.0\.0\((.*?)\)/, `0-0:1.0.0(${formattedDate})`);

    // Update the gas meter reading timestamp
    const gasReadingTime = new Date(now.getTime() - 5 * 60000); // 5 minutes earlier
    const formattedGasDate = formatDate(gasReadingTime, "yyMMddHHmmss") + "S";
    datagram = datagram.replace(/0-1:24\.2\.1\((.*?)\)/, `0-1:24.2.1(${formattedGasDate})`);

    return datagram;
}

client.on('connect', () => {
    console.log('Connected to MQTT broker');

    // Set up interval to send data every 20 seconds
    setInterval(() => {
        // Deep clone the data object
        let updatedData = JSON.parse(JSON.stringify(topicSpam.data));

        // Update the datagram with current date and time
        updatedData.datagram.p1 = updateDateTime(updatedData.datagram.p1);

        const message = JSON.stringify(updatedData);
        client.publish(topicSpam.topic, message);
        console.log(`Published to ${topicSpam.topic}: ${message}`);
    }, 20000);
});

client.on('error', (error) => {
    console.error('MQTT client error:', error);
});