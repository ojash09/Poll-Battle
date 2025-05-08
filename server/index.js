const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const rooms = {}; // In-memory room store

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const { type, payload } = JSON.parse(message);

    switch (type) {
      case 'CREATE_ROOM': {
        const roomId = uuidv4().slice(0, 6);
        rooms[roomId] = {
          question: payload.question || 'Which option do you prefer?',
          options: payload.options || ['Option A', 'Option B'],
          users: [],
          votes: {},
          voted: new Set(),
          timer: 60,
          interval: null
        };
        // Initialize vote counts
        for (const opt of rooms[roomId].options) rooms[roomId].votes[opt] = 0;

        ws.send(JSON.stringify({ type: 'ROOM_CREATED', payload: { roomId } }));
        break;
      }

      case 'JOIN_ROOM': {
        const { roomId, name } = payload;
        if (!rooms[roomId]) {
          ws.send(JSON.stringify({ type: 'ERROR', payload: 'Room not found' }));
          return;
        }

        ws.roomId = roomId;
        ws.name = name;
        rooms[roomId].users.push(ws);

        if (!rooms[roomId].interval) {
          rooms[roomId].interval = setInterval(() => {
            if (rooms[roomId].timer > 0) {
              rooms[roomId].timer--;
              broadcast(roomId, {
                type: 'TIMER_UPDATE',
                payload: rooms[roomId].timer
              });
            } else {
              clearInterval(rooms[roomId].interval);
              rooms[roomId].interval = null;
              broadcast(roomId, {
                type: 'VOTING_ENDED'
              });
            }
          }, 1000);
        }

        broadcast(roomId, { type: 'USER_JOINED', payload: { name } });
        ws.send(JSON.stringify({ type: 'QUESTION', payload: {
          question: rooms[roomId].question,
          options: rooms[roomId].options
        }}));
        ws.send(JSON.stringify({ type: 'VOTE_UPDATE', payload: rooms[roomId].votes }));
        ws.send(JSON.stringify({ type: 'TIMER_UPDATE', payload: rooms[roomId].timer }));
        break;
      }

      case 'VOTE': {
        const { option } = payload;
        const room = rooms[ws.roomId];
        if (!room || room.voted.has(ws.name) || room.timer <= 0) return;
        room.votes[option]++;
        room.voted.add(ws.name);
        broadcast(ws.roomId, {
          type: 'VOTE_UPDATE',
          payload: room.votes
        });
        break;
      }
    }
  });
});

function broadcast(roomId, data) {
  rooms[roomId].users.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

server.listen(8080, () => {
  console.log('WebSocket server running at ws://localhost:8080');
});