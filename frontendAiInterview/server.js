require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/token', (req, res) => {
  try {
    const { roomName, participantName } = req.body;
    
    if (!roomName || !participantName) {
      return res.status(400).json({ error: 'Missing roomName or participantName' });
    }

    const apiKey = process.env.VITE_APP_LIVEKIT_API_KEY;
    const apiSecret = process.env.VITE_APP_LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: '10m',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
    });

    const token = at.toJwt();
    res.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.listen(port, () => {
  console.log(`Token server running at http://localhost:${port}`);
});
