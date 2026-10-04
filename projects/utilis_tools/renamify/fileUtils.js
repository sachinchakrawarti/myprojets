// fileUtils.js - All file system operations

const fs = require('fs');
const path = require('path');
const config = require('./config');

// Get all files from assets folder
function getAllFiles() {
    try {
        if (!fs.existsSync(config.ASSETS_PATH)) {
            console.error(`❌ Assets folder not found: ${config.ASSETS_PATH}`);
            process.exit(1);
        }
        return fs.readdirSync(config.ASSETS_PATH);
    } catch (error) {
        console.error('❌ Error reading assets folder:', error.message);
        return [];
    }
}

// Check if file matches naming pattern
function isAlreadyNamed(file) {
    const nameWithoutExt = path.basename(file, path.extname(file));
    const pattern = new RegExp(`^${config.BASE_NAME}_\\d{${config.PADDING}}$`);
    return pattern.test(nameWithoutExt);
}

// Extract number from already named file
function getFileNumber(file) {
    const nameWithoutExt = path.basename(file, path.extname(file));
    const parts = nameWithoutExt.split('_');
    return parseInt(parts[parts.length - 1], 10);
}

// Get file extension
function getExtension(file) {
    return path.extname(file).toLowerCase();
}

// Check if file is an image
function isImage(file) {
    const ext = getExtension(file);
    return config.IMAGE_EXTENSIONS.includes(ext);
}

// Check if file is a video
function isVideo(file) {
    const ext = getExtension(file);
    return config.VIDEO_EXTENSIONS.includes(ext);
}

// Check if file is a media file (image or video)
function isMedia(file) {
    return isImage(file) || isVideo(file);
}

// Get file type (image, video, or other)
function getFileType(file) {
    if (isImage(file)) return 'image';
    if (isVideo(file)) return 'video';
    return 'other';
}

// Get file stats (size, modified date, etc.)
function getFileStats(file) {
    const filePath = path.join(config.ASSETS_PATH, file);
    try {
        return fs.statSync(filePath);
    } catch (error) {
        return null;
    }
}

// Rename a file
function renameFile(oldName, newName) {
    const oldPath = path.join(config.ASSETS_PATH, oldName);
    const newPath = path.join(config.ASSETS_PATH, newName);
    
    try {
        fs.renameSync(oldPath, newPath);
        return { success: true, oldName, newName };
    } catch (error) {
        return { success: false, oldName, newName, error: error.message };
    }
}

// Check if file exists
function fileExists(file) {
    const filePath = path.join(config.ASSETS_PATH, file);
    return fs.existsSync(filePath);
}

// Find highest number used (for a specific type or all)
function findHighestNumber(files, type = 'all') {
    let namedFiles = files.filter(file => isAlreadyNamed(file));
    
    if (type === 'image') {
        namedFiles = namedFiles.filter(file => isImage(file));
    } else if (type === 'video') {
        namedFiles = namedFiles.filter(file => isVideo(file));
    }
    
    if (namedFiles.length === 0) {
        return 0;
    }
    
    const numbers = namedFiles.map(file => getFileNumber(file));
    return Math.max(...numbers);
}

// Separate files into named and unnamed (with media type info)
function separateFiles(files) {
    const named = [];
    const unnamed = [];
    const nonMedia = [];
    const namedImages = [];
    const namedVideos = [];
    const unnamedImages = [];
    const unnamedVideos = [];
    
    files.forEach(file => {
        const fileType = getFileType(file);
        
        if (fileType === 'other') {
            nonMedia.push(file);
        } else if (isAlreadyNamed(file)) {
            named.push(file);
            if (fileType === 'image') {
                namedImages.push(file);
            } else {
                namedVideos.push(file);
            }
        } else {
            unnamed.push(file);
            if (fileType === 'image') {
                unnamedImages.push(file);
            } else {
                unnamedVideos.push(file);
            }
        }
    });
    
    return {
        named,
        unnamed,
        nonMedia,
        namedImages,
        namedVideos,
        unnamedImages,
        unnamedVideos,
        // Legacy aliases for backwards compatibility
        nonImages: nonMedia
    };
}

// Generate new filename with number
function generateNewName(number, extension) {
    const numberStr = String(number).padStart(config.PADDING, '0');
    return `${config.BASE_NAME}${numberStr}${extension}`;
}

// Generate new filename for a specific type (images and videos get separate sequences)
function generateNewNameForType(number, extension, type) {
    const numberStr = String(number).padStart(config.PADDING, '0');
    return `${config.BASE_NAME}${numberStr}${extension}`;
}

// Get file size in human readable format
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get video file info (basic stats, no external deps)
function getVideoInfo(file) {
    const stats = getFileStats(file);
    if (!stats) return null;
    
    return {
        name: file,
        size: formatFileSize(stats.size),
        sizeBytes: stats.size,
        modified: stats.mtime,
        extension: getExtension(file)
    };
}

module.exports = {
    getAllFiles,
    isAlreadyNamed,
    getFileNumber,
    getExtension,
    isImage,
    isVideo,
    isMedia,
    getFileType,
    getFileStats,
    renameFile,
    fileExists,
    findHighestNumber,
    separateFiles,
    generateNewName,
    generateNewNameForType,
    formatFileSize,
    getVideoInfo
};