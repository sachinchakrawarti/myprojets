// rename.js - Main script

const logger = require('./logger');
const config = require('./config');
const fileUtils = require('./fileUtils');

function main() {
    logger.header('🖼️  Renamify - Image Renamer');
    logger.info(`📁 Assets folder: ${config.ASSETS_PATH}`);
    logger.info(`📝 Base name: ${config.BASE_NAME}`);
    
    if (config.DRY_RUN) {
        logger.warning('🔍 DRY RUN MODE - No files will be renamed');
    }
    logger.separator();

    // Get all files
    const allFiles = fileUtils.getAllFiles();
    
    if (allFiles.length === 0) {
        logger.warning('Assets folder is empty!');
        logger.info(`   Place images in: ${config.ASSETS_PATH}`);
        return;
    }

    // Separate files
    const { named, unnamed, nonImages } = fileUtils.separateFiles(allFiles);
    
    logger.info(`📊 Found ${allFiles.length} files in assets folder`);
    logger.dim(`   ✅ Already named: ${named.length}`);
    logger.dim(`   📝 To rename:     ${unnamed.length}`);
    logger.dim(`   📄 Non-images:    ${nonImages.length}`);
    
    if (nonImages.length > 0 && config.VERBOSE) {
        logger.dim(`   ⚠️  Skipped files: ${nonImages.join(', ')}`);
    }
    logger.separator();

    if (unnamed.length === 0) {
        logger.success('🎉 All images are already properly named!');
        logger.info(`   Next number would be: ${fileUtils.generateNewName(named.length + 1, '.jpg')}`);
        return;
    }

    // Find highest number
    const highestNumber = fileUtils.findHighestNumber(allFiles);
    const startNumber = highestNumber + 1;
    
    logger.highlight(`🚀 Starting from: ${fileUtils.generateNewName(startNumber, '.jpg')}`);
    logger.dim(`   (Highest used: ${highestNumber})`);
    logger.separator();

    // Show existing named files (sample)
    if (named.length > 0) {
        logger.info(`📋 Existing files (showing up to 5):`);
        named.slice(0, 5).forEach(file => {
            logger.success(`   ${file}`);
        });
        if (named.length > 5) {
            logger.dim(`   ... and ${named.length - 5} more`);
        }
        logger.separator();
    }

    // Rename files
    let renamedCount = 0;
    let skippedCount = 0;
    let currentNumber = startNumber;

    logger.info(`📝 Renaming ${unnamed.length} files...`);
    logger.separator();

    unnamed.forEach((oldName, index) => {
        const ext = fileUtils.getExtension(oldName);
        const newName = fileUtils.generateNewName(currentNumber, ext);
        
        // Show progress
        logger.printProgress(index + 1, unnamed.length, oldName);

        // Check if new name already exists
        if (fileUtils.fileExists(newName)) {
            logger.clearProgress();
            logger.warning(`⚠️  Conflict: ${newName} already exists`);
            logger.dim(`   Skipping: ${oldName}`);
            skippedCount++;
            currentNumber++;
            return;
        }

        // Rename or dry run
        if (config.DRY_RUN) {
            logger.clearProgress();
            logger.success(`🔍 Would rename: ${oldName} → ${newName}`);
            renamedCount++;
            currentNumber++;
        } else {
            const result = fileUtils.renameFile(oldName, newName);
            if (result.success) {
                renamedCount++;
                currentNumber++;
            } else {
                logger.clearProgress();
                logger.error(`❌ Failed: ${oldName} → ${newName}`);
                logger.dim(`   ${result.error}`);
                skippedCount++;
            }
        }
    });

    logger.clearProgress();
    logger.separator();

    // Summary
    const summary = {
        renamed: renamedCount,
        skipped: skippedCount,
        alreadyNamed: named.length,
        nextNumber: fileUtils.generateNewName(currentNumber, '.jpg'),
        dryRun: config.DRY_RUN
    };
    
    logger.printSummary(summary);
    
    if (renamedCount > 0 && !config.DRY_RUN) {
        logger.success(`🎉 Successfully renamed ${renamedCount} images!`);
    } else if (renamedCount > 0 && config.DRY_RUN) {
        logger.info(`🔍 Dry run complete - ${renamedCount} files would be renamed`);
    }
}

// Run the main function
try {
    main();
} catch (error) {
    logger.error(`💥 Unexpected error: ${error.message}`);
    if (config.VERBOSE) {
        console.error(error);
    }
    process.exit(1);
}