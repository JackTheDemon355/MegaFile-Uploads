const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Serve public static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Keep-alive health check route for UptimeRobot
app.get('/ping', (req, res) => {
    res.status(200).send('PONG');
});

let activePeers = 0;

io.on('connection', (socket) => {
    activePeers++;
    io.emit('dev-stats', { peers: activePeers });

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', socket.id);

        socket.on('disconnect', () => {
            activePeers = Math.max(0, activePeers - 1);
            io.emit('dev-stats', { peers: activePeers });
            socket.to(roomId).emit('user-disconnected', socket.id);
        });
    });

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', {
            from: socket.id,
            signal: data.signal
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 MegaFile Upload running on port ${PORT}`));
