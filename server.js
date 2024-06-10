const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());  // Enable CORS for all routes

app.post('/switch-input', (req, res) => {
    const targetChannel = req.body.target_channel;

    // Define the channel IDs
    const CHANNEL_1_ID = '6460956';
    const CHANNEL_2_ID = '9821764';

    // Determine current and target channels
    let startChannelId;
    let stopChannelId;
    if (targetChannel === 'CHANNEL_1') {
        startChannelId = CHANNEL_1_ID;
        stopChannelId = CHANNEL_2_ID;
    } else if (targetChannel === 'CHANNEL_2') {
        startChannelId = CHANNEL_2_ID;
        stopChannelId = CHANNEL_1_ID;
    } else {
        return res.status(400).send('Invalid target channel');
    }

    // Start the target channel
    const startCommand = `aws medialive start-channel --channel-id ${startChannelId}`;
    exec(startCommand, (startError, startStdout, startStderr) => {
        if (startError) {
            console.error(`Start Error: ${startError.message}`);
            return res.status(500).send(startError.message);
        }
        if (startStderr) {
            console.error(`Start Stderr: ${startStderr}`);
            return res.status(500).send(startStderr);
        }

        console.log(`Started channel: ${startChannelId}`);
        console.log(`Start Stdout: ${startStdout}`);

        // Wait for the target channel to be up and running
        setTimeout(() => {
            // Stop the other channel
            const stopCommand = `aws medialive stop-channel --channel-id ${stopChannelId}`;
            exec(stopCommand, (stopError, stopStdout, stopStderr) => {
                if (stopError) {
                    console.error(`Stop Error: ${stopError.message}`);
                    return res.status(500).send(stopError.message);
                }
                if (stopStderr) {
                    console.error(`Stop Stderr: ${stopStderr}`);
                    return res.status(500).send(stopStderr);
                }

                console.log(`Stopped channel: ${stopChannelId}`);
                console.log(`Stop Stdout: ${stopStdout}`);

                res.json({ message: `Switched to ${targetChannel} successfully` });
            });
        }, 10000); // Adjust this delay as needed
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
