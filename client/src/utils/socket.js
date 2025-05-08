// src/utils/socket.js
import { io } from 'socket.io-client';
export const socket = new WebSocket('ws://localhost:8080');
