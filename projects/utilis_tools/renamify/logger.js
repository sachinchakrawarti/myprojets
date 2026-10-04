// logger.js - Beautiful console output

const config = require('./config');

// Colors for console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

// Log levels
function info(message) {
    console.log(`${colors.blue}ℹ️${colors.reset} ${message}`);
}

function success(message) {
    console.log(`${colors.green}✅${colors.reset} ${message}`);
}

function warning(message) {
    console.log(`${colors.yellow}⚠️${colors.reset} ${message}`);
}

function error(message) {
    console.log(`${colors.red}❌${colors.reset} ${message}`);
}

function highlight(message) {
    console.log(`${colors.bright}${colors.cyan}▶${colors.reset} ${message}`);
}

function dim(message) {
    console.log(`${colors.gray}${message}${colors.reset}`);
}

function header(title) {
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.bright}${colors.magenta}${title}${colors.reset}`);
    console.log('='.repeat(60));
}

function separator() {
    console.log(colors.gray + '-'.repeat(60) + colors.reset);
}

// Print summary table
function printSummary(stats) {
    header('📊 Summary');
    
    // Image stats
    if (stats.images) {
        console.log(`   ${colors.cyan}🖼️  Images:${colors.reset}`);
        console.log(`      ${colors.green}✅ Renamed:${colors.reset}      ${stats.images.renamed} files`);
        console.log(`      ${colors.yellow}⏭️  Skipped:${colors.reset}      ${stats.images.skipped} files`);
        console.log(`      ${colors.blue}📝 Already named:${colors.reset} ${stats.images.alreadyNamed} files`);
        console.log(`      ${colors.cyan}📁 Next number:${colors.reset}   ${stats.images.nextNumber}`);
        separator();
    }
    
    // Video stats
    if (stats.videos) {
        console.log(`   ${colors.cyan}🎬 Videos:${colors.reset}`);
        console.log(`      ${colors.green}✅ Renamed:${colors.reset}      ${stats.videos.renamed} files`);
        console.log(`      ${colors.yellow}⏭️  Skipped:${colors.reset}      ${stats.videos.skipped} files`);
        console.log(`      ${colors.blue}📝 Already named:${colors.reset} ${stats.videos.alreadyNamed} files`);
        console.log(`      ${colors.cyan}📁 Next number:${colors.reset}   ${stats.videos.nextNumber}`);
        separator();
    }
    
    // Total stats (legacy support)
    if (stats.renamed !== undefined) {
        console.log(`   ${colors.green}✅ Total Renamed:${colors.reset}      ${stats.renamed} files`);
        console.log(`   ${colors.yellow}⏭️  Total Skipped:${colors.reset}      ${stats.skipped} files`);
        console.log(`   ${colors.blue}📝 Total Already named:${colors.reset} ${stats.alreadyNamed} files`);
        console.log(`   ${colors.cyan}📁 Next number:${colors.reset}   ${stats.nextNumber}`);
    }
    
    // Non-media files
    if (stats.nonMedia !== undefined && stats.nonMedia > 0) {
        console.log(`   ${colors.gray}📄 Non-media files:${colors.reset} ${stats.nonMedia} files (ignored)`);
    }
    
    if (stats.dryRun) {
        console.log(`\n   ${colors.yellow}🔍 DRY RUN:${colors.reset}    No files were actually renamed`);
    }
    separator();
}

// Print progress bar
function printProgress(current, total, fileName) {
    const percent = Math.round((current / total) * 100);
    const barLength = 30;
    const filled = Math.round((percent / 100) * barLength);
    const empty = barLength - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const truncatedName = fileName.length > 25 ? fileName.substring(0, 22) + '...' : fileName;
    process.stdout.write(`\r${colors.cyan}${bar}${colors.reset} ${percent}% (${current}/${total}) ${truncatedName}`);
}

function clearProgress() {
    process.stdout.write('\r' + ' '.repeat(80) + '\r');
}

// Print file being processed
function printFileAction(oldName, newName, dryRun = false) {
    const prefix = dryRun ? `${colors.yellow}[DRY RUN]${colors.reset}` : `${colors.green}[RENAMED]${colors.reset}`;
    console.log(`${prefix} ${colors.gray}${oldName}${colors.reset} → ${colors.cyan}${newName}${colors.reset}`);
}

// Print video-specific info
function printVideoInfo(file, info) {
    console.log(`${colors.magenta}🎬${colors.reset} ${colors.bright}${file}${colors.reset}`);
    console.log(`   ${colors.gray}Size: ${info.size} | Modified: ${info.modified.toLocaleDateString()}${colors.reset}`);
}

// Print detected media type
function printMediaType(type, count) {
    const icon = type === 'video' ? '🎬' : '🖼️';
    const label = type === 'video' ? 'Videos' : 'Images';
    console.log(`   ${icon} ${label}: ${colors.bright}${count}${colors.reset} files`);
}

module.exports = {
    info,
    success,
    warning,
    error,
    highlight,
    dim,
    header,
    separator,
    printSummary,
    printProgress,
    clearProgress,
    printFileAction,
    printVideoInfo,
    printMediaType,
    colors
};