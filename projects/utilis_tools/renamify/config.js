// config.js - All settings in one place

const path = require('path');

module.exports = {
    // Folder where images are stored
    ASSETS_PATH: path.join(__dirname, 'assets'),
    
    // Base name for renamed files
    BASE_NAME: 'akanksha_puri',
    
    // Supported image formats
    IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'],
    
    // Number padding (6 = 000001, 4 = 0001, etc.)
    PADDING: 6,
    
    // If true, only preview changes (no actual renaming)
    DRY_RUN: false,
    
    // If true, show detailed logs
    VERBOSE: true
};