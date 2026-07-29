#!/usr/bin/env node

/**
 * Volume Module Test Suite
 * Tests all volume module functionality
 */

const chalk = require('chalk');
const Table = require('cli-table3');
const VolumeService = require('../service');
const VolumeFetcher = require('../fetch');
const VolumeMapper = require('../mapper');
const VolumeValidator = require('../validator');
const db = require('../../database/connection');
const logger = require('../../../binance_api/eth_price_n_ohlcv_data_api/utils/logger');

// Test configuration
const TEST_CONFIG = {
    symbol: 'ETH',
    testDate: '2026-07-22',
    testRange: {
        start: '2026-07-01',
        end: '2026-07-22'
    }
};

class VolumeTestRunner {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runAll() {
        console.log(chalk.green('\n🚀 Running Volume Module Tests\n'));
        console.log(chalk.gray('═'.repeat(60)));

        await this.testFetch();
        await this.testMapper();
        await this.testValidator();
        await this.testService();
        await this.testIntegration();

        this.printSummary();
    }

    /**
     * Test Volume Fetcher
     */
    async testFetch() {
        console.log(chalk.yellow('\n📡 Testing Volume Fetcher...'));

        try {
            // Test single provider fetch
            const results = await VolumeFetcher.fetchAll(TEST_CONFIG.symbol, TEST_CONFIG.testDate);
            
            console.log(chalk.gray(`  Fetched from ${Object.keys(results.results).length} providers`));
            
            for (const [provider, data] of Object.entries(results.results)) {
                if (data) {
                    console.log(chalk.green(`  ✅ ${provider}: ${data.volume_24h || 'N/A'}`));
                }
            }

            if (results.errors.length > 0) {
                console.log(chalk.yellow(`  ⚠️ ${results.errors.length} providers had errors`));
            }

            this.recordTest('Fetcher - Fetch All', true);
        } catch (error) {
            console.log(chalk.red(`  ❌ Fetcher test failed: ${error.message}`));
            this.recordTest('Fetcher - Fetch All', false, error.message);
        }

        // Test multiple symbols
        try {
            const multiResults = await VolumeFetcher.fetchMultipleVolumes(['ETH', 'BTC']);
            console.log(chalk.green(`  ✅ Multi-symbol fetch: ${Object.keys(multiResults.results).length} symbols`));
            this.recordTest('Fetcher - Multi Symbol', true);
        } catch (error) {
            console.log(chalk.red(`  ❌ Multi-symbol fetch failed: ${error.message}`));
            this.recordTest('Fetcher - Multi Symbol', false, error.message);
        }
    }

    /**
     * Test Volume Mapper
     */
    async testMapper() {
        console.log(chalk.yellow('\n🔄 Testing Volume Mapper...'));

        try {
            // Test mapping from each provider
            const providers = ['binance', 'coingecko', 'cryptocompare'];
            
            for (const provider of providers) {
                try {
                    const rawData = await VolumeFetcher.fetchAll(TEST_CONFIG.symbol, TEST_CONFIG.testDate);
                    if (rawData.results[provider]) {
                        const mapped = VolumeMapper.mapToStandard(rawData.results[provider], provider);
                        console.log(chalk.green(`  ✅ ${provider} mapped: ${mapped.volume_24h || 'N/A'}`));
                        this.recordTest(`Mapper - ${provider}`, true);
                    }
                } catch (error) {
                    console.log(chalk.yellow(`  ⚠️ ${provider} mapping skipped: ${error.message}`));
                    this.recordTest(`Mapper - ${provider}`, false, error.message);
                }
            }

            // Test merge
            const volumes = [
                { date: TEST_CONFIG.testDate, symbol: 'ETH', volume_24h: 1000000, source: 'binance' },
                { date: TEST_CONFIG.testDate, symbol: 'ETH', volume_24h: 950000, source: 'coingecko' },
                { date: TEST_CONFIG.testDate, symbol: 'ETH', volume_24h: 1020000, source: 'cryptocompare' }
            ];
            
            const merged = VolumeMapper.mergeVolumes(volumes);
            console.log(chalk.green(`  ✅ Merge successful: ${merged.volume_24h.toFixed(2)} (confidence: ${merged.confidence})`));
            this.recordTest('Mapper - Merge', true);

        } catch (error) {
            console.log(chalk.red(`  ❌ Mapper test failed: ${error.message}`));
            this.recordTest('Mapper - General', false, error.message);
        }
    }

    /**
     * Test Volume Validator
     */
    async testValidator() {
        console.log(chalk.yellow('\n✅ Testing Volume Validator...'));

        try {
            // Test valid data
            const validData = {
                date: TEST_CONFIG.testDate,
                symbol: TEST_CONFIG.symbol,
                volume_24h: 1500000000,
                volume_change_24h: 5.2,
                avg_volume_7d: 1200000000,
                avg_volume_30d: 1100000000,
                source: 'binance'
            };

            const validated = VolumeValidator.validate(validData);
            console.log(chalk.green(`  ✅ Valid data passed: quality score ${VolumeValidator.calculateQualityScore(validated)}/100`));
            this.recordTest('Validator - Valid Data', true);

            // Test invalid data
            const invalidData = {
                date: 'invalid-date',
                symbol: 'ETH',
                volume_24h: -100,
                source: 'binance'
            };

            try {
                VolumeValidator.validate(invalidData);
                console.log(chalk.red('  ❌ Invalid data should have failed'));
                this.recordTest('Validator - Invalid Data', false);
            } catch (error) {
                console.log(chalk.green(`  ✅ Invalid data caught: ${error.message}`));
                this.recordTest('Validator - Invalid Data', true);
            }

            // Test bulk validation
            const bulkData = [
                validData,
                { date: '2026-07-21', symbol: 'ETH', volume_24h: 1200000000, source: 'binance' },
                { date: '2026-07-20', symbol: 'ETH', volume_24h: 800000000, source: 'coingecko' }
            ];

            const bulkResults = VolumeValidator.validateBulk(bulkData);
            console.log(chalk.green(`  ✅ Bulk validation: ${bulkResults.valid.length} valid, ${bulkResults.invalid.length} invalid`));
            this.recordTest('Validator - Bulk', true);

        } catch (error) {
            console.log(chalk.red(`  ❌ Validator test failed: ${error.message}`));
            this.recordTest('Validator - General', false, error.message);
        }
    }

    /**
     * Test Volume Service
     */
    async testService() {
        console.log(chalk.yellow('\n🔧 Testing Volume Service...'));

        try {
            // Test get volume data
            const data = await VolumeService.getVolumeData(TEST_CONFIG.symbol, TEST_CONFIG.testDate);
            
            console.log(chalk.green(`  ✅ Got volume data: $${(data.merged.volume_24h / 1e9).toFixed(2)}B`));
            console.log(chalk.gray(`     Sources: ${data.sources.length}, Confidence: ${data.merged.confidence.toFixed(2)}`));
            this.recordTest('Service - Get Volume', true);

            // Test volume range
            const rangeData = await VolumeService.getVolumeRange(
                TEST_CONFIG.symbol,
                TEST_CONFIG.testRange.start,
                TEST_CONFIG.testRange.end
            );
            
            console.log(chalk.green(`  ✅ Got volume range: ${rangeData.length} days`));
            this.recordTest('Service - Volume Range', true);

            // Test moving averages
            const ma = await VolumeService.calculateVolumeMA(TEST_CONFIG.symbol, [7, 14, 30]);
            console.log(chalk.green(`  ✅ Moving averages calculated:`));
            for (const [period, value] of Object.entries(ma)) {
                console.log(chalk.gray(`     ${period}: $${(value / 1e9).toFixed(2)}B`));
            }
            this.recordTest('Service - Moving Averages', true);

            // Test anomaly detection
            const anomalies = await VolumeService.detectAnomalies(TEST_CONFIG.symbol, 2.0);
            console.log(chalk.green(`  ✅ Anomaly detection: ${anomalies.anomalies.length} anomalies found`));
            if (anomalies.anomalies.length > 0) {
                for (const anomaly of anomalies.anomalies) {
                    console.log(chalk.yellow(`     ${anomaly.date}: ${anomaly.type} (z-score: ${anomaly.zScore.toFixed(2)})`));
                }
            }
            this.recordTest('Service - Anomaly Detection', true);

        } catch (error) {
            console.log(chalk.red(`  ❌ Service test failed: ${error.message}`));
            this.recordTest('Service - General', false, error.message);
        }
    }

    /**
     * Integration Tests
     */
    async testIntegration() {
        console.log(chalk.yellow('\n🔗 Running Integration Tests...'));

        try {
            // Test full flow: fetch → map → validate → save
            const volumeData = await VolumeService.getVolumeData(TEST_CONFIG.symbol);
            
            if (volumeData.merged) {
                // Verify data was saved
                const saved = await VolumeService.getSavedVolumeData(TEST_CONFIG.symbol, TEST_CONFIG.testDate);
                
                if (saved && saved.length > 0) {
                    console.log(chalk.green(`  ✅ Data successfully saved and retrieved`));
                    console.log(chalk.gray(`     ${saved.length} records found in database`));
                    this.recordTest('Integration - Save/Retrieve', true);
                } else {
                    console.log(chalk.yellow(`  ⚠️ No saved data found for ${TEST_CONFIG.testDate}`));
                    this.recordTest('Integration - Save/Retrieve', false, 'No data in database');
                }
            }

            // Test database connection
            try {
                const dbCheck = await db.queryOne('SELECT 1 as test');
                console.log(chalk.green(`  ✅ Database connection verified`));
                this.recordTest('Integration - Database Connection', true);
            } catch (error) {
                console.log(chalk.red(`  ❌ Database connection failed: ${error.message}`));
                this.recordTest('Integration - Database Connection', false, error.message);
            }

            // Test volume data quality
            const qualityReport = VolumeValidator.getValidationReport(volumeData.merged);
            console.log(chalk.green(`  ✅ Quality report generated: ${qualityReport.qualityScore}/100`));
            this.recordTest('Integration - Quality Report', true);

        } catch (error) {
            console.log(chalk.red(`  ❌ Integration test failed: ${error.message}`));
            this.recordTest('Integration - General', false, error.message);
        }
    }

    /**
     * Record test results
     */
    recordTest(name, passed, error = null) {
        this.results.tests.push({ name, passed, error });
        if (passed) {
            this.results.passed++;
        } else {
            this.results.failed++;
        }
    }

    /**
     * Print test summary
     */
    printSummary() {
        console.log(chalk.green('\n📊 Test Summary\n'));
        console.log(chalk.gray('═'.repeat(60)));

        const summaryTable = new Table({
            head: ['Test Name', 'Status', 'Error'],
            style: { head: ['cyan'] }
        });

        for (const test of this.results.tests) {
            const status = test.passed ? chalk.green('✅ PASSED') : chalk.red('❌ FAILED');
            summaryTable.push([
                test.name,
                status,
                test.error ? chalk.red(test.error) : chalk.gray('N/A')
            ]);
        }

        console.log(summaryTable.toString());

        console.log(chalk.gray('\n' + '═'.repeat(60)));
        console.log(chalk.bold(`\n📈 Results: ${chalk.green(this.results.passed)} passed, ${chalk.red(this.results.failed)} failed`));

        if (this.results.failed === 0) {
            console.log(chalk.green('\n🎉 All tests passed!\n'));
        } else {
            console.log(chalk.red(`\n❌ ${this.results.failed} tests failed. Please check the errors above.\n`));
            process.exit(1);
        }
    }
}

// Run tests
const runner = new VolumeTestRunner();
runner.runAll().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
});

module.exports = VolumeTestRunner;