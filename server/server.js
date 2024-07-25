const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const tmi = require('tmi.js');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config({ path: './credentials.env' }); // Load environment variables from credentials.env file

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('Server is running');
});

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const port = 3001;

const twitchOptions = {
    options: {
        clientId: process.env.TWITCH_CLIENT_ID,
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: process.env.TWITCH_USERNAME,
        password: process.env.TWITCH_PASSWORD
    },
    channels: [process.env.TWITCH_USERNAME]
};

const twitchClient = new tmi.Client(twitchOptions);
twitchClient.connect();

let sentimentCounts = {
    positive: 0,
    negative: 0
};
const recentMessagesSentiments = [];
const sentimentCountsTimeline = [];

const wordFrequencies = {};

const user_scores = {};
const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by',
    'for', 'if', 'in', 'into', 'is', 'it',
    'no', 'not', 'of', 'on', 'or', 'such',
    'that', 'the', 'their', 'then', 'there', 'these',
    'they', 'this', 'to', 'was', 'will', 'with'
]);

twitchClient.on('message', async (channel, tags, message, self) => {
    if (self) return;
    try {
        const response = await axios.post('http://127.0.0.1:5000/analyze', { text: message });
        const sentiment = response.data.sentiment;

        if (sentiment === 'POSITIVE') {
            sentimentCounts.positive += 1;
        } else if (sentiment === 'NEGATIVE') {
            sentimentCounts.negative += 1;
        }

        if (recentMessagesSentiments.length >= 500) {
            recentMessagesSentiments.shift();
        }
        recentMessagesSentiments.push(sentiment);

        io.emit('updateSentimentCounts', sentimentCounts);
        io.emit('recentSentiments', recentMessagesSentiments);
        io.emit('chatMessage', { user: tags['display-name'], message, sentiment });
        if (sentiment === 'POSITIVE') {
            const username = tags['display-name'];
            user_scores[username] = (user_scores[username] || 0) + 1;

            const sortedUsers = Object.entries(user_scores).sort((a, b) => b[1] - a[1]).slice(0, 5);
            io.emit('updateTopPositiveChatters', sortedUsers);
        }

        sentimentCountsTimeline.push({
            ...sentimentCounts,
            timestamp: new Date().getTime() + 3600000
        });

        if (sentimentCountsTimeline.length > 500) {
            sentimentCountsTimeline.shift();
        }

        io.emit('sentimentCountsOverTime', sentimentCountsTimeline);

        const words = message.split(/\W+/).map(word => word.toLowerCase()).filter(word => !stopWords.has(word));

        for (let word of words) {
            wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
        }
    } catch (error) {
        console.error("Error occurred:", error.message);
    }
});

setInterval(() => {
    const sortedWords = Object.entries(wordFrequencies).sort((a, b) => b[1] - a[1]).slice(0, 20);
    io.emit('topWordsUpdate', sortedWords);
}, 10000); // Every 10 seconds

io.on('connection', (socket) => {
    socket.on('changeChannel', (newChannel) => {
        twitchClient.part(twitchOptions.channels[0]);
        twitchOptions.channels[0] = newChannel;
        twitchClient.join(newChannel);
    });
});

app.get('/sentimentDataOverTime', (req, res) => {
    res.json(sentimentCountsTimeline);
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});