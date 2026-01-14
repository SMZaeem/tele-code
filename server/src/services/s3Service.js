const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

exports.generatePresignedUrl = async (fileName, fileType, roomId) => {
    // Unique key: uploads/roomId/timestamp-filename
    // Using simple alphanumeric characters to avoid URL encoding issues
    const cleanFileName = fileName.replace(/\s+/g, '-');
    const key = `uploads/${roomId}/${Date.now()}-${cleanFileName}`;
    
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    });

    // 1. Generate the upload URL (User writes to this)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // 2. Generate the Public View URL (User reads from this)
    // Format: https://BUCKET.s3.REGION.amazonaws.com/KEY
    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, fileKey: key, publicUrl };
};