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

// Find highest number used
function findHighestNumber(files) {
    const namedFiles = files.filter(file => isAlreadyNamed(file));
    
    if (namedFiles.length === 0) {
        return 0;
    }
    
    const numbers = namedFiles.map(file => getFileNumber(file));
    return Math.max(...numbers);
}

// Separate files into named and unnamed
function separateFiles(files) {
    const named = [];
    const unnamed = [];
    const nonImages = [];
    
    files.forEach(file => {
        if (!isImage(file)) {
            nonImages.push(file);
        } else if (isAlreadyNamed(file)) {
            named.push(file);
        } else {
            unnamed.push(file);
        }
    });
    
    return { named, unnamed, nonImages };
}

// Generate new filename with number
function generateNewName(number, extension) {
    const numberStr = String(number).padStart(config.PADDING, '0');
    return `${config.BASE_NAME}_${numberStr}${extension}`;
}

module.exports = {
    getAllFiles,
    isAlreadyNamed,
    getFileNumber,
    getExtension,
    isImage,
    getFileStats,
    renameFile,
    fileExists,
    findHighestNumber,
    separateFiles,
    generateNewName
};