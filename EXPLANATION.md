WebSocket Chat Application

Overview

A real-time chat application using WebSockets, featuring smooth scrolling, user join notifications, and Redis-based chat history.

Features

Live group chat

Smooth scrolling to the latest message

User join notifications

Chat history storage using Redis

Responsive UI with MUI components

Backend (Node.js + WebSocket + Redis)

Setup

git clone https://github.com/Karthicksrini/chat-app/
cd backend
npm install
npm run dev # Start WebSocket server

API Endpoints

GET /history → Fetch chat history from Redis

WebSocket Events

message: { username, text, timestamp }

join: { username }

Frontend (React + MUI)

Setup

cd frontend
npm install
npm run dev

Features

Enter username and send messages

Messages displayed in real-time

Auto-scroll to latest message:


How to Use

Start Redis (redis-server)

Run backend (node server.js)

Run frontend (npm run dev)

Open http://localhost:5173 and start chatting

Technologies Used

Backend: Node.js, WebSockets (ws), Redis

Frontend: React.js, Next.js, MUI

Database: Redis

