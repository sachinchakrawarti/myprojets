// renameAll.js - Rename both images and videos (unified script)

const config = require('./config');
const fileUtils = require('./fileUtils');
const logger = require('./logger');

function main() {
    logger.header('🎬🖼️  Media File Renamer (Images + Videos)');
    
    // Get all files
    const allFiles = fileUtils.getAllFiles();
    logger.info(`Found ${allFiles.length} total files in assets folder`);
    
    // Separate files
    const { 
        unnamedImages,
        unnamedVideos,
        namedImages,
        namedVideos,
        nonMedia 
    } = fileUtils.separateFiles(allFiles);
    
    logger.printMediaType('image', unnamedImages.length);
    logger.printMediaType('video', unnamedVideos.length);
    
    if (nonMedia.length > 0) {
        logger.dim(`   📄 Non-media files: ${nonMedia.length} (ignored)`);
    }
    
    logger.separator();
    
    // Get starting numbers for each type
    const highestImageNumber = fileUtils.findHighestNumber(allFiles, 'image');
    const highestVideoNumber = fileUtils.findHighestNumber(allFiles, 'video');
    
    logger.info(`Highest image number: ${highestImageNumber}`);
    logger.info(`Highest video number: ${highestVideoNumber}`);
    
    const stats = {
        images: { renamed: 0, skipped: 0, alreadyNamed: namedImages.length, nextNumber: 0 },
        videos: { renamed: 0, skipped: 0, alreadyNamed: namedVideos.length, nextNumber: 0 },
        nonMedia: nonMedia.length,
        dryRun: config.DRY_RUN
    };
    
    // Process images
    if (unnamedImages.length > 0) {
        logger.header('🖼️  Renaming Images');
        let imageNumber = highestImageNumber + 1;
        
        const sortedImages = unnamedImages.sort((a, b) => {
            const statsA = fileUtils.getFileStats(a);
            const statsB = fileUtils.getFileStats(b);
            if (!statsA || !statsB) return 0;
            return statsA.mtime - statsB.mtime;
        });
        
        sortedImages.forEach((file, index) => {
            const ext = fileUtils.getExtension(file);
            const newName = fileUtils.generateNewName(imageNumber, ext);
            
            logger.printProgress(index + 1, sortedImages.length, file);
            
            if (fileUtils.fileExists(newName)) {
                logger.clearProgress();
                logger.warning(`Skipped ${file} (target exists)`);
                stats.images.skipped++;
                imageNumber++;
                return;
            }
            
            if (config.DRY_RUN) {
                stats.images.renamed++;
            } else {
                const result = fileUtils.renameFile(file, newName);
                if (result.success) {
                    stats.images.renamed++;
                } else {
                    logger.clearProgress();
                    logger.error(`Failed: ${file}`);
                    stats.images.skipped++;
                }
            }
            imageNumber++;
        });
        
        logger.clearProgress();
        stats.images.nextNumber = imageNumber;
        logger.success(`Images: ${stats.images.renamed} renamed, ${stats.images.skipped} skipped`);
    } else {
        stats.images.nextNumber = highestImageNumber + 1;
        logger.info('No unnamed images to process');
    }
    
    // Process videos
    if (unnamedVideos.length > 0) {
        logger.header('🎬 Renaming Videos');
        let videoNumber = highestVideoNumber + 1;
        
        const sortedVideos = unnamedVideos.sort((a, b) => {
            const statsA = fileUtils.getFileStats(a);
            const statsB = fileUtils.getFileStats(b);
            if (!statsA || !statsB) return 0;
            return statsA.mtime - statsB.mtime;
        });
        
        sortedVideos.forEach((file, index) => {
            const ext = fileUtils.getExtension(file);
            const newName = fileUtils.generateNewName(videoNumber, ext);
            
            logger.printProgress(index + 1, sortedVideos.length, file);
            
            if (fileUtils.fileExists(newName)) {
                logger.clearProgress();
                logger.warning(`Skipped ${file} (target exists)`);
                stats.videos.skipped++;
                videoNumber++;
                return;
            }
            
            if (config.DRY_RUN) {
                stats.videos.renamed++;
            } else {
                const result = fileUtils.renameFile(file, newName);
                if (result.success) {
                    stats.videos.renamed++;
                } else {
                    logger.clearProgress();
                    logger.error(`Failed: ${file}`);
                    stats.videos.skipped++;
                }
            }
            videoNumber++;
        });
        
        logger.clearProgress();
        stats.videos.nextNumber = videoNumber;
        logger.success(`Videos: ${stats.videos.renamed} renamed, ${stats.videos.skipped} skipped`);
    } else {
        stats.videos.nextNumber = highestVideoNumber + 1;
        logger.info('No unnamed videos to process');
    }
    
    // Print final summary
    logger.printSummary(stats);
}

// Run the script
main();