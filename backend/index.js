const WebSocket = require('ws');
const http = require('http');
const Redis = require("redis");
const server = http.createServer();
const wss = new WebSocket.Server({ server });
const clients = new Map();
const PORT = 5000;
const redisClient = Redis.createClient();

redisClient.connect();

redisClient.on("error", (err) => console.error("Redis Error:", err));

const chatHistoryKey = "chat_history";


// Function to get chat history from Redis
const getChatHistory = async () => {
    const history = await redisClient.lRange(chatHistoryKey, 0, -1);
    return history.map((msg) => JSON.parse(msg));
};

// Function to store messages in Redis
const saveMessage = async (message) => {
    await redisClient.rPush(chatHistoryKey, JSON.stringify(message));
    await redisClient.lTrim(chatHistoryKey, -50, -1); // Keep only last 50 messages
};


wss.on('connection', async (ws) => {
    // Send chat history to the new user
    const chatHistory = await getChatHistory();
    ws.send(JSON.stringify({ type: "chatHistory", messages: chatHistory }));

    ws.on('message', async (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === 'join') {
            clients.set(ws, parsedMessage.username);
            const sendMessage = { type: 'user', action: "connect", message: `${parsedMessage.username} joined the chat.` }
            await saveMessage(sendMessage);
            broadcast(sendMessage);
        } else if (parsedMessage.type === 'message') {
            const username = clients.get(ws) || 'Anonymous';
            const sendMessage = { type: 'message', username, text: parsedMessage.text, timestamp: new Date().toISOString() }
            await saveMessage(sendMessage);
            broadcast(sendMessage);
        }
    });

    ws.on('close', async () => {
        const username = clients.get(ws);
        clients.delete(ws);
        if (username) {
            const sendMessage = { type: 'user', action: "disconnect", message: `${username} left the chat.` }
            await saveMessage(sendMessage);
            broadcast(sendMessage);

        }
    });
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

server.listen(PORT, () => {
    console.log(`WebSocket server is running on ${PORT}`);
});
