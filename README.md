#Stream Insight — Real-Time Sentiment Analysis for Twitch Chat

Stream Insight is a real-time web app that connects to Twitch chat, analyzes the sentiment of incoming messages using BERT, and visualizes audience mood as the stream progresses.

---

## Features

- Live connection to Twitch IRC chat
- Sentiment classification with BERT (positive, neutral, negative)
- Real-time frontend updates (React + Flask + WebSocket)
- Secure environment variable handling

---
```
## Project Structure

Stream_Insight/
├── frontend/             # React UI
├── server/
│   ├── server.js         # Twitch IRC + WebSocket bridge
│   └── sentiment_api.py  # BERT-based sentiment API (Flask)
├── requirements.txt      # Python dependencies
├── package.json          # Node dependencies
├── .env.example          # Template for secrets
└── README.md
```
---

## Getting Started

### 1. Clone the repo

git clone https://github.com/naman-pagaria/Stream_Insight.git
cd Stream_Insight

### 2. Setup environment

Use the `.env.example` to create your own `.env` file.

cp .env.example .env  
# then edit `.env` with your real Twitch credentials

---

## Running the App (3-Terminal Setup)

Open **3 terminals** and run:

### Terminal 1: React Frontend

cd frontend  
npm install  
npm start

### Terminal 2: Twitch Chat Listener

cd server  
node server.js

### Terminal 3: Sentiment Analysis API

cd server  
python3 sentiment_api.py

---

## Dependencies

Install everything in a virtual environment:

python3 -m venv .venv  
source .venv/bin/activate  
pip install -r requirements.txt

---

## 📄 License

MIT © [Naman Pagaria](https://github.com/naman-pagaria)
