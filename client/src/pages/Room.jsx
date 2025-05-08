import React, { useEffect, useState } from 'react';

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
    <div>
      <h1>Room ID: {roomId}</h1>
      <p>Welcome, {name}!</p>
      <h2>{question}</h2>
      <p>Time Left: {timer}s</p>
      {options.map((opt) => (
        <button key={opt} onClick={() => vote(opt)} disabled={!!voted || votingEnded}>{opt}</button>
      ))}
      <div>
        {options.map((opt) => (
          <div key={opt}>{opt}: {votes[opt] || 0}</div>
        ))}
      </div>
      {voted && <p>You voted for: {voted}</p>}
      {votingEnded && <p>Voting has ended.</p>}
    </div>
  );
}