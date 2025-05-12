# 🗳️ Poll Battle

**Poll Battle** is a real-time polling application built with **React** and **WebSocket**, allowing users to create and join rooms to vote on questions live.

## 🚀 Setup Instructions

Follow these steps to run the app locally:

### 1. Clone the Repository

git clone https://github.com/ojash09/Poll_Battle
cd Poll_Battle

### 2. Start the WebSocket Server

cd server
npm install
node index.js
Server runs at ws://localhost:8080

### 3. Start the React Client

Open a new terminal:
cd client
npm install
npm start
Client runs at http://localhost:3000

### ✨ Features
✅ Create unique poll rooms with custom questions and options

🧑‍🤝‍🧑 Real-time user join updates

📊 Live vote tracking with instant updates

⏱️ 60-second countdown timer for each room

🛡️ Prevents duplicate voting from the same user

🧠 Architecture: Vote State & Room Management
Room and vote states are entirely managed on the WebSocket server. When a room is created:

A unique 6-character room ID is generated

The question, options, vote counts, and timer are stored

Each user is assigned a name and added to a users list

A 60-second countdown starts on first user join

Each vote is validated and then broadcasted to all users in the room via VOTE_UPDATE. The server ensures:

One user = one vote

Real-time synchronization across all clients

Voting ends when the timer hits 0

### 📁 Project Structure

Poll_Battle/
├── client/         # React frontend
│   └── src/
├── server/         # WebSocket server
│   └── index.js
└── README.md
📌 Tech Stack
Frontend: React (Create React App)

Backend: Node.js, WebSocket (ws)

Real-time Communication: WebSocket protocol