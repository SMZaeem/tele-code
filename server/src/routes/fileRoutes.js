const express = require('express');
const router = express.Router();
const { generatePresignedUrl } = require('../services/s3Service');

router.post('/upload-url', async (req, res) => {
    try {
        const { fileName, fileType, roomId } = req.body;
        
        // Call the service
        const { uploadUrl, fileKey, publicUrl } = await generatePresignedUrl(fileName, fileType, roomId);
        
        // Send all three back to frontend
        res.json({ uploadUrl, fileKey, publicUrl });
    } catch (error) {
        console.error('S3 Presign Error:', error);
        res.status(500).json({ error: 'Failed to generate upload URL' });
    }
});

module.exports = router;