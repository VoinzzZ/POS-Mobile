const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary.config');

// Configure Cloudinary storage for multer - Products
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pos-mobile/products', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
            {
                width: 800,
                height: 800,
                crop: 'limit', // Maintain aspect ratio, don't exceed dimensions
                quality: 'auto:good',
                fetch_format: 'auto', // Auto-optimize format
            }
        ],
    },
});

// Configure Cloudinary storage for store logo
const storeLogoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pos-mobile/store', // Folder name in Cloudinary for store
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
            {
                width: 300,
                height: 300,
                crop: 'limit', // Maintain aspect ratio, don't exceed dimensions
                quality: 'auto:good',
                fetch_format: 'auto', // Auto-optimize format
            }
        ],
    },
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer for products
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
});

// Configure multer for store logo
const uploadStoreLogo = multer({
    storage: storeLogoStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max file size for logo
    },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size is too large. Maximum size is 5MB.',
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next();
};

// Helper function to delete image from Cloudinary
const deleteImage = async (imageUrl, folder = 'products') => {
    try {
        // Extract public_id from Cloudinary URL
        const urlParts = imageUrl.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = `pos-mobile/${folder}/${publicIdWithExt.split('.')[0]}`;
        
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️ Image deleted from Cloudinary (${folder}):`, result);
        return result;
    } catch (error) {
        console.error(`❌ Error deleting image from Cloudinary (${folder}):`, error);
        throw error;
    }
};

module.exports = {
    upload,
    uploadStoreLogo,
    handleMulterError,
    deleteImage,
};
