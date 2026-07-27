/**
 * Volume Data Validator
 * Validates volume data quality and consistency
 */

import logger from '../../binance_api/eth_price_n_ohlcv_data_api/utils/logger.js';

class VolumeValidator {
    constructor() {
        this.rules = {
            volume_24h: { required: true, min: 0, max: 1e12, type: 'number' },
            volume_change_24h: { required: false, min: -100, max: 1000, type: 'number' },
            avg_volume_7d: { required: false, min: 0, type: 'number' },
            avg_volume_30d: { required: false, min: 0, type: 'number' },
            volume_rank: { required: false, min: 0, max: 10000, type: 'number' }
        };
    }

    validate(data) {
        try {
            const errors = [];
            const warnings = [];

            if (!data.date) errors.push('Missing required field: date');
            if (!data.symbol) errors.push('Missing required field: symbol');

            for (const [field, rule] of Object.entries(this.rules)) {
                if (rule.required && (data[field] === undefined || data[field] === null)) {
                    errors.push(`Missing required field: ${field}`);
                    continue;
                }

                if (data[field] !== undefined && data[field] !== null) {
                    if (rule.type === 'number' && typeof data[field] !== 'number') {
                        data[field] = parseFloat(data[field]);
                        if (isNaN(data[field])) {
                            errors.push(`Invalid number for ${field}: ${data[field]}`);
                            continue;
                        }
                    }

                    if (rule.min !== undefined && data[field] < rule.min) {
                        warnings.push(`${field} (${data[field]}) below minimum ${rule.min}`);
                    }
                    if (rule.max !== undefined && data[field] > rule.max) {
                        warnings.push(`${field} (${data[field]}) above maximum ${rule.max}`);
                    }
                }
            }

            if (data.volume_24h && data.avg_volume_7d) {
                const ratio = data.volume_24h / data.avg_volume_7d;
                if (ratio > 5) warnings.push(`Volume spike detected: ${data.volume_24h} vs 7d avg ${data.avg_volume_7d}`);
                if (ratio < 0.2) warnings.push(`Volume drop detected: ${data.volume_24h} vs 7d avg ${data.avg_volume_7d}`);
            }

            if (data.date) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(data.date)) {
                    try {
                        const d = new Date(data.date);
                        data.date = d.toISOString().split('T')[0];
                    } catch (error) {
                        errors.push(`Invalid date format: ${data.date}`);
                    }
                }
            }

            if (warnings.length > 0) {
                logger.warn(`Volume validation warnings:`, warnings);
            }

            if (errors.length > 0) {
                throw new Error(`Validation errors: ${errors.join(', ')}`);
            }

            data._validated = true;
            data._validatedAt = new Date().toISOString();
            data._warnings = warnings;

            return data;
        } catch (error) {
            logger.error('Volume validation failed:', error.message);
            throw error;
        }
    }

    validateBulk(entries) {
        const results = { valid: [], invalid: [], errors: [] };
        for (const entry of entries) {
            try {
                const validated = this.validate(entry);
                results.valid.push(validated);
            } catch (error) {
                results.invalid.push(entry);
                results.errors.push({ entry, error: error.message });
            }
        }
        return results;
    }

    calculateQualityScore(data) {
        let score = 0;

        const requiredFields = ['date', 'symbol', 'volume_24h'];
        const presentFields = requiredFields.filter(f => data[f] !== undefined && data[f] !== null);
        score += (presentFields.length / requiredFields.length) * 40;

        if (data.volume_24h > 0) {
            const logVolume = Math.log10(data.volume_24h);
            if (logVolume >= 7 && logVolume <= 10) score += 30;
            else if (logVolume >= 6 && logVolume <= 11) score += 20;
            else score += 10;
        }

        let consistencyScore = 0;
        if (data.avg_volume_7d && data.avg_volume_30d) {
            const ratio7_30 = data.avg_volume_7d / data.avg_volume_30d;
            if (ratio7_30 >= 0.8 && ratio7_30 <= 1.2) consistencyScore += 15;
            else if (ratio7_30 >= 0.5 && ratio7_30 <= 1.5) consistencyScore += 10;
            else consistencyScore += 5;
        }
        if (data.volume_24h && data.avg_volume_7d) {
            const ratio = data.volume_24h / data.avg_volume_7d;
            if (ratio >= 0.5 && ratio <= 2) consistencyScore += 15;
            else if (ratio >= 0.2 && ratio <= 5) consistencyScore += 10;
            else consistencyScore += 5;
        }
        score += consistencyScore;

        return Math.min(100, Math.round(score));
    }

    getValidationReport(volumeData) {
        const report = {
            date: new Date().toISOString(),
            symbol: volumeData.symbol || 'unknown',
            qualityScore: this.calculateQualityScore(volumeData),
            fields: {},
            issues: []
        };

        for (const [field, rule] of Object.entries(this.rules)) {
            const value = volumeData[field];
            report.fields[field] = {
                present: value !== undefined && value !== null,
                type: typeof value,
                value: value,
                valid: true
            };

            if (value !== undefined && value !== null && rule.type === 'number') {
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    report.fields[field].valid = false;
                    report.issues.push(`${field} is not a valid number`);
                }
            }
        }

        return report;
    }
}

export default new VolumeValidator();