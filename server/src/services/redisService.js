const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis(process.env.REDIS_URL);

// 24 hours in seconds
const ROOM_TTL = 86400; 

exports.setRoomExpiry = async (roomId) => {
    // Refreshes the TTL every time this is called (activity detected)
    await redis.expire(`room:${roomId}`, ROOM_TTL);
};

exports.addFileToRoom = async (roomId, fileData) => {
    const key = `room:${roomId}:files`;
    // Push new file to the list
    await redis.rpush(key, JSON.stringify(fileData));
    // Reset expiration for the file list too
    await redis.expire(key, ROOM_TTL);
};

exports.getRoomFiles = async (roomId) => {
    const key = `room:${roomId}:files`;
    const files = await redis.lrange(key, 0, -1);
    return files.map(file => JSON.parse(file));
};

exports.deleteFileFromRoom = async (roomId, fileKey) => {
    const key = `room:${roomId}:files`;
    
    // 1. Get all current files
    const fileStrings = await redis.lrange(key, 0, -1);
    
    // 2. Find the item to remove (parse, check key, re-stringify)
    const itemToRemove = fileStrings.find(fileString => {
        const file = JSON.parse(fileString);
        return file.key === fileKey;
    });

    if (itemToRemove) {
        // 3. LREM removes the first occurrence of this exact string
        await redis.lrem(key, 1, itemToRemove);
    }
};

exports.redisClient = redis;