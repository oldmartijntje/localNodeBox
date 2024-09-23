const fs = require('fs');
const path = require('path');
const { appRouter } = require('./appRouter');
const cors = require("cors");
const express = require("express");
const expressStatic = require('express').static;
const { exit } = require("process");

let id = [0];

// Function to load settings from a JSON file
async function loadSettings(settingsPath) {
    try {
        const data = await fs.promises.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(data);
        return settings;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Settings file not found: ${settingsPath}`);
        } else if (error instanceof SyntaxError) {
            console.error(`Error decoding JSON from settings file: ${settingsPath}`);
        } else {
            console.error(`Error reading settings file: ${error.message}`);
        }
        return null;
    }
}

// Main function to execute on startup
async function main() {
    const settings = await loadSettings('settings.json');

    if (!settings) {
        return;
    }
}

// Run the application on startup
main().then(() => {
    const settings = require('./settings.json');
    const port = settings.port || 3000;
    const staticHtmlPath = path.join(__dirname, './docs');


    const app = express();

    app.get('/ping', (_req, res) => {
        res.sendStatus(200);
    });

    app.set('trust proxy', true);
    app.use(cors());
    app.use(expressStatic(staticHtmlPath));
    app.use("/connect", appRouter);
    // start the Express server
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}...`);
    }).on('error', (err) => {
        console.error('Server startup error:', err);
        exit(1);
    });
}).catch((error) => {
    console.error('Application error:', error);
    exit(1);
});





