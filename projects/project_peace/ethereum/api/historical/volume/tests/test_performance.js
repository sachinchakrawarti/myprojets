#!/usr/bin/env node

/**
 * Performance Test for Volume Module
 */

const chalk = require('chalk');
const VolumeService = require('../service');

async function performanceTest() {
    console.log(chalk.blue('\n⚡ Performance Test\n'));

    const tests = [
        { name: 'Single volume fetch', fn: () => VolumeService.getVolumeData('ETH') },
        { name: 'Volume range (30 days)', fn: () => VolumeService.getVolumeRange('ETH', '2026-06-22', '2026-07-22') },
        { name: 'Moving averages', fn: () => VolumeService.calculateVolumeMA('ETH', [7, 14, 30]) },
        { name: 'Anomaly detection', fn: () => VolumeService.detectAnomalies('ETH', 2.0) }
    ];

    const results = [];

    for (const test of tests) {
        console.log(chalk.yellow(`\nRunning: ${test.name}...`));
        
        const start = performance.now();
        try {
            await test.fn();
            const duration = performance.now() - start;
            console.log(chalk.green(`  ✅ Completed in ${duration.toFixed(2)}ms`));
            results.push({ name: test.name, duration, passed: true });
        } catch (error) {
            console.log(chalk.red(`  ❌ Failed: ${error.message}`));
            results.push({ name: test.name, duration: 0, passed: false });
        }
    }

    // Summary
    console.log(chalk.green('\n📊 Performance Summary\n'));
    console.log(chalk.gray('═'.repeat(60)));

    const total = results.reduce((sum, r) => sum + r.duration, 0);
    const passed = results.filter(r => r.passed).length;

    for (const result of results) {
        const status = result.passed ? chalk.green('✅') : chalk.red('❌');
        console.log(`${status} ${result.name}: ${result.duration.toFixed(2)}ms`);
    }

    console.log(chalk.gray('═'.repeat(60)));
    console.log(chalk.bold(`\nTotal: ${total.toFixed(2)}ms (${passed}/${results.length} passed)`));

    if (passed === results.length) {
        console.log(chalk.green('\n🎉 All performance tests passed!\n'));
    } else {
        console.log(chalk.red(`\n❌ ${results.length - passed} tests failed.\n`));
        process.exit(1);
    }
}

performanceTest();