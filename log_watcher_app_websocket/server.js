const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

const path = './test.txt';
const port = 8085;

let last_10 = [];
let clients = new Set();
let timer = 1;

// Load existing last 10 lines from file
if (fs.existsSync(path)) {
    const data = fs.readFileSync(path, 'utf-8').trim().split('\n');
    last_10 = data.slice(-10); // Keep only last 10
} else {
    fs.writeFileSync(path, ''); // Create empty file if doesn't exist
}

// Function to maintain last 10 lines
function saveLastLines(line) {
    if (last_10.length >= 10) last_10.shift(); // Keep buffer size 10
    last_10.push(line);
}

// Function to broadcast data to all clients
function broadcast(data) {
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    }
}

// Generate and broadcast new data every second
setInterval(() => {
    const line = `new data: ${timer++}`;
    fs.appendFile(path, line + '\n', (err) => {
        if (err) console.error('Failed to write to file:', err);
    });
    saveLastLines(line);
    broadcast(line);
}, 1000);

// HTTP server to serve index.html
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile('./index.html', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading file');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

// WebSocket server setup
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New client connected!');
    clients.add(ws);

    // Send last 10 lines when a client connects
    last_10.forEach(line => ws.send(line));

    // Handle disconnection
    ws.on('close', () => {
        console.log('Client disconnected!');
        clients.delete(ws);
    });
});

// Start server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
