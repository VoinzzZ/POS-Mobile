const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary.config');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pos-mobile/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
            {
                width: 800,
                height: 800,
                crop: 'limit',
                quality: 'auto:good',
                fetch_format: 'auto',
            }
        ],
    },
});

const storeLogoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pos-mobile/store',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
            {
                width: 300,
                height: 300,
                crop: 'limit',
                quality: 'auto:good',
                fetch_format: 'auto',
            }
        ],
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

const uploadStoreLogo = multer({
    storage: storeLogoStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
});
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

const deleteImage = async (imageUrl, folder = 'products') => {
    try {
        const urlParts = imageUrl.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = `pos-mobile/${folder}/${publicIdWithExt.split('.')[0]}`;

        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    upload,
    uploadStoreLogo,
    handleMulterError,
    deleteImage,
};
