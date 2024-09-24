const mqtt = require('mqtt');
const fs = require('fs');
const express = require("express");
const { tr } = require('date-fns/locale');

const appRouter = express.Router();
appRouter.use(express.json());
let scanning = false;

/**
 * Scan for all mqtt topics
 */
appRouter.post("/scanMqtt", async (req, res) => {
    try {
        let minutes = req.body.minutes ? req.body.minutes : 1;
        let broker = req.body.broker ? req.body.broker : "test.mosquitto.org:888";
        broker = broker.split(":")[0];
        if (scanning) {
            res.status(400).send("Already scanning");
            return;
        }
        scanning = true;
        let responded = false;
        const startTime = new Date();
        const scanDuration = minutes * 60 * 1000;
        const outputFile = 'mqtt_scan_data.json';
        let capturedTopics = {};
        function saveResults() {
            // sort capturedTopics by value
            capturedTopics = Object.fromEntries(
                Object.entries(capturedTopics).sort(([, a], [, b]) => b - a)
            );
            const data = {
                topics: capturedTopics,
                time: new Date(),
                startTime: startTime,
            };
            fs.writeFile(outputFile, JSON.stringify(data, null, 2), (err) => {
                if (err) {
                    console.error('Error writing results to file:', err);
                } else {
                    console.log(`Results saved to ${outputFile}`);
                }
            });
            if (new Date() - startTime > scanDuration && scanning) {
                console.log("Scan complete");
                client.end();
                saveResults();
                scanning = false;
                clearInterval(interval);
            }
        }
        let interval = setInterval(() => {
            saveResults();
        }, 10000);
        const client = mqtt.connect(`mqtt://${broker}`, { qos: 1 });
        client.on('connect', () => {
            client.subscribe('#', (err) => {
                if (err) {
                    console.error('Error subscribing to topics:', err);
                } else {
                    console.log('Subscribed to all topics');
                }
            });
            client.on('message', (topic, message) => {
                if (capturedTopics[topic] === undefined) {
                    capturedTopics[topic] = 0;
                }
                capturedTopics[topic]++;
            });

            console.log(scanDuration)
            setTimeout(() => {
                console.log("Scan complete");
                client.end();
                scanning = false;
                saveResults();
                clearInterval(interval);
            }, scanDuration);

            if (!responded) {
                responded = true;
                res.status(200).send("Scanning");
            }
        });




    } catch (error) {
        res.status(500).send(error.message);

    }
});

/**
 * Get the list of mqtt topics
 */
appRouter.get("/getScanData", async (_req, res) => {
    try {
        const data = fs.readFileSync('mqtt_scan_data.json');
        const parsedData = JSON.parse(data);
        const topics = parsedData.topics;
        const minuteDifference = (new Date(parsedData.time) - new Date(parsedData.startTime)) / 60000;
        const allKeys = Object.keys(topics);
        for (let i = 0; i < allKeys.length; i++) {
            topics[allKeys[i]] = {
                callsPerMinute: Math.round(topics[allKeys[i]] / minuteDifference),
                total: topics[allKeys[i]],
                callsPerHour: Math.round(topics[allKeys[i]] / minuteDifference * 60),
            }
        }
        res.status(200).send(topics);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * Create a project.
 */
appRouter.post("/displayItems", async (_req, res) => {
    try {

    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * Update a project.
 */
appRouter.put("/displayItems", async (_req, res) => {

});

module.exports = {
    appRouter: appRouter
}