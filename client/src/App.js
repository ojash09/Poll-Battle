import React, { useState } from 'react';
import Room from './pages/Room';
import './App.css'
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
    <div className="container">
  <h1>Live Poll Battle</h1>
  <div className="input-group">
    <label htmlFor="name">Your Name</label>
    <input
      type="text"
      id="name"
      placeholder="Enter your name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  </div>
  <div className="input-group">
    <label htmlFor="question">Custom Question</label>
    <input
      type="text"
      id="question"
      placeholder="Custom Question"
      value={customQuestion}
      onChange={(e) => setCustomQuestion(e.target.value)}
    />
  </div>
  <div className="input-group">
    <label htmlFor="optionA">Option A</label>
    <input
      type="text"
      id="optionA"
      placeholder="Option A"
      value={optionA}
      onChange={(e) => setOptionA(e.target.value)}
    />
  </div>
  <div className="input-group">
    <label htmlFor="optionB">Option B</label>
    <input
      type="text"
      id="optionB"
      placeholder="Option B"
      value={optionB}
      onChange={(e) => setOptionB(e.target.value)}
    />
  </div>
  <button onClick={handleCreateRoom} disabled={!name || !optionA || !optionB}>
    Create Room
  </button>
  <hr />
  <div className="input-group">
    <label htmlFor="roomId">Room ID</label>
    <input
      type="text"
      id="roomId"
      placeholder="Room ID"
      value={roomId}
      onChange={(e) => setRoomId(e.target.value)}
    />
  </div>
  <button onClick={handleJoinRoom} disabled={!name || !roomId}>
    Join Room
  </button>
</div>
  );
  
}

export default App;