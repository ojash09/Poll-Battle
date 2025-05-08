'use client';

import React, { useEffect, useState } from 'react';
import './Room.css'; // ⬅️ Make sure to import the CSS file

export default function Room({ roomId, name, socket }) {
  const [votes, setVotes] = useState({});
  const [voted, setVoted] = useState(localStorage.getItem(roomId));
  const [timer, setTimer] = useState(60);
  const [votingEnded, setVotingEnded] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);

  useEffect(() => {
    socket.onmessage = (message) => {
      const { type, payload } = JSON.parse(message.data);
      if (type === 'QUESTION') {
        setQuestion(payload.question);
        setOptions(payload.options);
      }
      if (type === 'VOTE_UPDATE') setVotes(payload);
      if (type === 'TIMER_UPDATE') setTimer(payload);
      if (type === 'VOTING_ENDED') setVotingEnded(true);
    };
  }, [roomId, socket]);

  const vote = (option) => {
    if (voted || timer <= 0 || votingEnded) return;
    socket.send(JSON.stringify({ type: 'VOTE', payload: { option } }));
    localStorage.setItem(roomId, option);
    setVoted(option);
  };

  return (
    <div className="room-container">
      <div className="room-card">
        <h1 className="room-title">🗳️ Poll Room</h1>
        <p className="room-id">Room ID: <strong>{roomId}</strong></p>
        <p className="welcome-text">Welcome, <strong>{name}</strong>!</p>

        <div className="question-box">
          <h2 className="question-text">{question || "Waiting for question..."}</h2>
          <p className="timer">⏳ Time Left: {timer}s</p>
        </div>

        <div className="vote-buttons">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => vote(opt)}
              disabled={!!voted || votingEnded}
              className={`vote-button ${voted || votingEnded ? 'disabled' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="results-box">
          {options.map((opt) => (
            <div key={opt} className="result-line">
              <span>{opt}</span>
              <span><strong>{votes[opt] || 0}</strong> vote(s)</span>
            </div>
          ))}
        </div>

        {voted && <p className="status voted">✅ You voted for: {voted}</p>}
        {votingEnded && <p className="status ended">Voting has ended.</p>}
      </div>
    </div>
  );
}
