const cloudinary = require('cloudinary').v2;
const { logError, logSuccess } = require('./logger');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (file, folder = 'products') => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: `pos/${folder}`,
            resource_type: 'image',
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
            ],
        });

        logSuccess('Image uploaded successfully', {
            publicId: result.public_id,
            url: result.secure_url,
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
        };
    } catch (error) {
        logError(error, { context: 'uploadImage', folder });
        throw new Error('Failed to upload image');
    }
};

const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            logSuccess('Image deleted successfully', { publicId });
            return true;
        }

        return false;
    } catch (error) {
        logError(error, { context: 'deleteImage', publicId });
        throw new Error('Failed to delete image');
    }
};

const updateImage = async (oldPublicId, newFile, folder = 'products') => {
    try {
        if (oldPublicId) {
            await deleteImage(oldPublicId);
        }

        return await uploadImage(newFile, folder);
    } catch (error) {
        logError(error, { context: 'updateImage', oldPublicId });
        throw new Error('Failed to update image');
    }
};

const validateImage = (file) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error('Invalid image format. Only JPEG, PNG, and WebP are allowed');
    }

    if (file.size > maxSize) {
        throw new Error('Image size exceeds 5MB limit');
    }

    return true;
};

const getImageUrl = (publicId) => {
    if (!publicId) return null;
    return cloudinary.url(publicId, {
        transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
        ],
    });
};

const getThumbnailUrl = (publicId) => {
    if (!publicId) return null;
    return cloudinary.url(publicId, {
        transformation: [
            { width: 200, height: 200, crop: 'fill' },
            { quality: 'auto:low' },
            { fetch_format: 'auto' },
        ],
    });
};

module.exports = {
    uploadImage,
    deleteImage,
    updateImage,
    validateImage,
    getImageUrl,
    getThumbnailUrl,
};
