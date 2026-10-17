// File storage, backed by Vercel Blob (previously AWS S3).
// Exported function names are kept the same so routes/controllers
// elsewhere in the app did not need to change.
const { put, del } = require('@vercel/blob');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|mp4|mov|m4v/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype || extname) {
            return cb(null, true);
        }
        cb(new Error('Only images and videos are allowed'));
    },
});

const uploadToS3 = async (file, folder = 'logos') => {
    const fileName = `${folder}/${Date.now()}_${path.basename(file.originalname).replace(/\s/g, '_')}`;

    const blob = await put(fileName, file.buffer, {
        access: 'public',
        contentType: file.mimetype,
        token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return blob.url; // Full public URL, stored directly in the DB
};

const deleteFromStorage = async (url) => {
    if (!url) return;
    try {
        await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch (error) {
        console.error('Error deleting blob:', error);
    }
};

const isS3Value = (value) => {
    // Kept for compatibility with existing call sites: true for anything
    // that looks like a stored file reference (a Vercel Blob URL).
    if (!value) return false;
    return typeof value === 'string' && value.trim().length > 0;
};

const getSignedUrlForView = async (value) => {
    // Vercel Blob URLs (with `access: 'public'`) are already directly
    // viewable, so no signing step is needed — just return the stored URL.
    return value || null;
};

module.exports = { upload, uploadToS3, deleteFromStorage, getSignedUrlForView, isS3Value };
