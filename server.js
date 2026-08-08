const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Render provides process.env.PORT dynamically
const PORT = process.env.PORT || 3000;

// Serve static assets from public/ folder
app.use(express.static(path.join(__dirname, 'public')));

// Ping Endpoint for UptimeRobot / Ping Robot Keep-Alive
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

io.on('connection', (socket) => {
  console.log(`[+] Client connected: ${socket.id}`);

  let currentRoom = 'public-room';
  joinRoom(socket, currentRoom);
  broadcastStats();

  // Handle Joining Custom Rooms
  socket.on('join-room', (roomName) => {
    if (!roomName) return;
    socket.leave(currentRoom);
    currentRoom = roomName;
    joinRoom(socket, currentRoom);
    broadcastStats();
  });

  // WebRTC Signaling Handlers
  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', {
      sdp: data.sdp,
      caller: socket.id
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', {
      sdp: data.sdp,
      responder: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      sender: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log(`[-] Client disconnected: ${socket.id}`);
    broadcastStats();
  });
});

function joinRoom(socket, roomName) {
  socket.join(roomName);
  console.log(`Peer ${socket.id} joined room: ${roomName}`);
  socket.to(roomName).emit('peer-joined', { peerId: socket.id });
}

function broadcastStats() {
  const totalPeers = io.engine.clientsCount;
  io.emit('dev-stats', {
    peers: totalPeers
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 megafile-uploads running on port ${PORT}`);
  console.log(`Press '` + '`' + `' in browser to toggle Developer HUD.\n`);
});
