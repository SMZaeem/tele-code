const { YSocketIO } = require('y-socket.io/dist/server');
const redisService = require('../services/redisService');

module.exports = (io) => {
    // Initialize Yjs Sync Logic
    const ySocketIO = new YSocketIO(io);
    
    // Initialize Yjs handlers
    ySocketIO.initialize();

    // Standard Socket.io Events
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // 1. Join Room Logic
        socket.on('join-room', async (roomId) => {
            socket.join(roomId);
            await redisService.setRoomExpiry(roomId); // Reset self-destruct timer
            
            // Send existing files to the new user
            const files = await redisService.getRoomFiles(roomId);
            socket.emit('load-files', files);
        });

        // 2. File Upload Notification
        // Client uploads to S3 directly, then tells us "I'm done"
        socket.on('file-uploaded', async ({ roomId, fileData }) => {
            // fileData = { name, url, size, type }
            
            // Save metadata to Redis
            await redisService.addFileToRoom(roomId, fileData);
            
            // Broadcast to everyone else in the room
            socket.to(roomId).emit('new-file', fileData);
        });

        // 3. Activity Monitor (Optional)
        // Refresh Redis TTL on any activity
        socket.on('activity', async (roomId) => {
            await redisService.setRoomExpiry(roomId);
        });

        // 4. File Delete Logic
        socket.on('delete-file', async ({ roomId, fileKey }) => {
            try {
                // Remove from Redis Database
                await redisService.deleteFileFromRoom(roomId, fileKey);
                
                // Broadcast to EVERYONE (including sender) to remove from UI
                io.to(roomId).emit('file-deleted', fileKey);
                
            } catch (error) {
                console.error("Failed to delete file from Redis:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};