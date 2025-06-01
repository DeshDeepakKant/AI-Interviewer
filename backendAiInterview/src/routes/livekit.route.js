import express from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { asyncHandler } from '../utils/aysncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = express.Router();

// Generate LiveKit token
const generateLiveKitToken = asyncHandler(async (req, res) => {
    try {
        const { room, username } = req.body;
        
        if (!room || !username) {
            throw new ApiError(400, 'Room and username are required');
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        
        if (!apiKey || !apiSecret) {
            throw new ApiError(500, 'LiveKit credentials not configured');
        }

        const at = new AccessToken(apiKey, apiSecret, {
            identity: username,
            ttl: '2h', // Token expires in 2 hours
        });
        
        // Add grants to the token
        at.addGrant({
            roomJoin: true,
            room: room,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        const token = at.toJwt();
        
        return res.status(200).json(
            new ApiResponse(200, {
                token,
                url: process.env.LIVEKIT_WS_URL
            }, 'Token generated successfully')
        );
    } catch (error) {
        console.error('Error generating LiveKit token:', error);
        throw new ApiError(500, error.message || 'Failed to generate token');
    }
});

// Routes
router.route('/token').post(generateLiveKitToken);

export default router;
