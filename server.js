const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Keep-alive endpoint for UptimeRobot
app.get('/ping', (req, res) => res.status(200).send('pong'));

// Store room passcodes in memory (optional room protection)
const roomPasscodes = new Map();

io.on('connection', (socket) => {
  let currentRoom = 'public-room';

  joinRoom(socket, currentRoom);
  broadcastStats();

// Handle Room Joining / Switch
  socket.on('join-room', (data = {}) => {
    // Safely extract roomName whether passed as an object or a plain string
    const rawRoom = typeof data === 'object' ? data.roomName : data;
    const targetRoom = (typeof rawRoom === 'string' && rawRoom.trim()) ? rawRoom.trim() : 'public-room';
    const passcode = typeof data === 'object' ? data.passcode : null;

    // Verify passcode if room has one set
    if (roomPasscodes.has(targetRoom)) {
      if (roomPasscodes.get(targetRoom) !== passcode) {
        socket.emit('auth-error', 'Incorrect room password.');
        return;
      }
    } else if (passcode) {
      // Set room passcode if it's new
      roomPasscodes.set(targetRoom, passcode);
    }

    socket.leave(currentRoom);
    currentRoom = targetRoom;
    joinRoom(socket, currentRoom);
    socket.emit('room-joined', { roomName: currentRoom });
    broadcastStats();
  });

  // WebRTC Signaling
  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', { sdp: data.sdp, caller: socket.id });
  });

  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', { sdp: data.sdp, responder: socket.id });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', { candidate: data.candidate, sender: socket.id });
  });

  // Chat messaging signaling relay
  socket.on('send-message', (data) => {
    socket.to(currentRoom).emit('receive-message', {
      sender: socket.id,
      text: data.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  socket.on('disconnect', () => {
    broadcastStats();
  });
});

function joinRoom(socket, roomName) {
  socket.join(roomName);
  socket.to(roomName).emit('peer-joined', { peerId: socket.id });
}

function broadcastStats() {
  io.emit('dev-stats', { peers: io.engine.clientsCount });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 megafile-uploads running on port ${PORT}`);
});
