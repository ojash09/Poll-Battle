import React, { useState } from 'react';
import Room from './pages/Room';

function App() {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [socket, setSocket] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [optionA, setOptionA] = useState('Cats');
  const [optionB, setOptionB] = useState('Dogs');

  const initSocket = (callback) => {
    const newSocket = new WebSocket('ws://localhost:8080');
    newSocket.onopen = () => callback(newSocket);
    newSocket.onerror = (err) => console.error('WebSocket Error:', err);
  };

  const handleCreateRoom = () => {
    initSocket((ws) => {
      ws.onmessage = (message) => {
        const { type, payload } = JSON.parse(message.data);
        if (type === 'ROOM_CREATED') {
          setRoomId(payload.roomId);
          setSocket(ws);
          setJoined(true);
        }
      };
      ws.send(JSON.stringify({
        type: 'CREATE_ROOM',
        payload: {
          question: customQuestion,
          options: [optionA, optionB]
        }
      }));
    });
  };

  const handleJoinRoom = () => {
    initSocket((ws) => {
      setSocket(ws);
      setJoined(true);
      ws.send(JSON.stringify({ type: 'JOIN_ROOM', payload: { roomId, name } }));
    });
  };

  if (joined && socket) return <Room roomId={roomId} name={name} socket={socket} />;

  return (
    <div>
      <h1>Live Poll Battle</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br/>
      <input
        type="text"
        placeholder="Custom Question"
        value={customQuestion}
        onChange={(e) => setCustomQuestion(e.target.value)}
      /><br/>
      <input
        type="text"
        placeholder="Option A"
        value={optionA}
        onChange={(e) => setOptionA(e.target.value)}
      />
      <input
        type="text"
        placeholder="Option B"
        value={optionB}
        onChange={(e) => setOptionB(e.target.value)}
      /><br/>
      <button onClick={handleCreateRoom} disabled={!name || !optionA || !optionB}>Create Room</button>
      <br/>
      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={handleJoinRoom} disabled={!name || !roomId}>Join Room</button>
    </div>
  );
}

export default App;