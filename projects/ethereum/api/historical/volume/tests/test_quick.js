#!/usr/bin/env node

/**
 * Quick Volume Test - Fast validation
 */

import chalk from 'chalk';
import VolumeService from '../service.js';

async function quickTest() {
    console.log(chalk.blue('\n⚡ Quick Volume Test\n'));

    try {
        console.log(chalk.yellow('1. Getting latest volume...'));
        const data = await VolumeService.getVolumeData('ETH');
        console.log(chalk.green(`   ✅ Volume: $${(data.merged.volume_24h / 1e9).toFixed(2)}B`));
        console.log(chalk.gray(`   Sources: ${data.sources.map(s => s.source).join(', ')}`));

        console.log(chalk.yellow('\n2. Checking anomalies...'));
        const anomalies = await VolumeService.detectAnomalies('ETH', 2.0);
        console.log(chalk.green(`   ✅ Anomalies: ${anomalies.anomalies.length} found`));
        
        if (anomalies.anomalies.length > 0) {
            for (const anomaly of anomalies.anomalies) {
                console.log(chalk.yellow(`   ⚠️ ${anomaly.date}: ${anomaly.type} (${anomaly.zScore.toFixed(2)}σ)`));
            }
        } else {
            console.log(chalk.gray('   No significant anomalies detected'));
        }

        console.log(chalk.yellow('\n3. Retrieving saved data...'));
        const saved = await VolumeService.getSavedVolumeData('ETH', null);
        console.log(chalk.green(`   ✅ Found ${saved.length} records`));
        
        if (saved.length > 0) {
            const latest = saved[0];
            console.log(chalk.gray(`   Latest: ${latest.date} - $${(latest.volume_24h / 1e9).toFixed(2)}B`));
        }

        console.log(chalk.green('\n✅ Quick test completed successfully!\n'));

    } catch (error) {
        console.error(chalk.red('❌ Quick test failed:'), error.message);
        process.exit(1);
    }
}

quickTest();