/**
 * Volume Service
 * Orchestrates volume data fetching, mapping, and storage
 */

import VolumeFetcher from './fetch.js';
import VolumeMapper from './mapper.js';
import VolumeValidator from './validator.js';
import db from '../database/connection.js';
import logger from '../../binance_api/eth_price_n_ohlcv_data_api/utils/logger.js';

class VolumeService {
    constructor() {
        this.fetcher = VolumeFetcher;
        this.mapper = VolumeMapper;
        this.validator = VolumeValidator;
    }

    async getVolumeData(symbol = 'ETH', date = null) {
        try {
            logger.info(`Fetching volume data for ${symbol} on ${date || 'latest'}`);
            const { results, errors } = await this.fetcher.fetchAll(symbol, date);

            if (Object.keys(results).length === 0) {
                throw new Error('No volume data available from any provider');
            }

            const mappedVolumes = [];
            for (const [provider, data] of Object.entries(results)) {
                try {
                    const mapped = this.mapper.mapToStandard(data, provider);
                    const validated = this.validator.validate(mapped);
                    mappedVolumes.push(validated);
                } catch (error) {
                    logger.error(`Failed to map ${provider} volume:`, error.message);
                }
            }

            const merged = this.mapper.mergeVolumes(mappedVolumes);
            merged.confidence = this.mapper.calculateConfidence(merged);

            await this.saveVolumeData(merged);

            return {
                merged,
                sources: mappedVolumes,
                errors: errors.length > 0 ? errors : undefined
            };
        } catch (error) {
            logger.error('Failed to get volume data:', error.message);
            throw error;
        }
    }

    async getVolumeRange(symbol = 'ETH', startDate, endDate) {
        try {
            const results = [];
            let currentDate = new Date(startDate);

            while (currentDate <= new Date(endDate)) {
                const dateStr = currentDate.toISOString().split('T')[0];
                try {
                    const data = await this.getVolumeData(symbol, dateStr);
                    results.push(data);
                } catch (error) {
                    logger.warn(`No volume data for ${dateStr}:`, error.message);
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }

            return results;
        } catch (error) {
            logger.error('Failed to get volume range:', error.message);
            throw error;
        }
    }

    async saveVolumeData(volumeData) {
        try {
            const sql = `
                INSERT OR REPLACE INTO historical_volume 
                (date, symbol, volume_24h, volume_change_24h, avg_volume_7d, avg_volume_30d, 
                 volume_rank, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                volumeData.date,
                volumeData.symbol,
                volumeData.volume_24h,
                volumeData.volume_change_24h || 0,
                volumeData.avg_volume_7d || 0,
                volumeData.avg_volume_30d || 0,
                volumeData.volume_rank || 0,
                volumeData.source || 'merged'
            ];

            await db.executeQuery(sql, params);
            logger.debug(`Volume data saved for ${volumeData.symbol} on ${volumeData.date}`);

            if (volumeData.sources) {
                for (const source of volumeData.sources) {
                    await this.saveVolumeData({
                        date: source.date,
                        symbol: source.symbol,
                        volume_24h: source.volume_24h,
                        volume_change_24h: source.volume_change_24h || 0,
                        avg_volume_7d: source.avg_volume_7d || 0,
                        avg_volume_30d: source.avg_volume_30d || 0,
                        source: source.source
                    });
                }
            }

            return true;
        } catch (error) {
            logger.error('Failed to save volume data:', error.message);
            throw error;
        }
    }

    async getSavedVolumeData(symbol = 'ETH', date = null) {
        try {
            let sql = `SELECT * FROM historical_volume WHERE symbol = ?`;
            const params = [symbol];

            if (date) {
                sql += ` AND date = ?`;
                params.push(date);
            }

            sql += ` ORDER BY date DESC LIMIT 30`;
            return await db.queryAll(sql, params);
        } catch (error) {
            logger.error('Failed to get saved volume data:', error.message);
            throw error;
        }
    }

    async calculateVolumeMA(symbol = 'ETH', periods = [7, 14, 30]) {
        try {
            const volumes = await this.getSavedVolumeData(symbol);
            const result = {};

            for (const period of periods) {
                if (volumes.length >= period) {
                    const slice = volumes.slice(0, period);
                    const sum = slice.reduce((acc, v) => acc + v.volume_24h, 0);
                    result[`ma_${period}d`] = sum / period;
                }
            }

            return result;
        } catch (error) {
            logger.error('Failed to calculate volume MA:', error.message);
            throw error;
        }
    }

    async detectAnomalies(symbol = 'ETH', threshold = 2.0) {
        try {
            const volumes = await this.getSavedVolumeData(symbol, null);
            
            if (volumes.length < 30) {
                return { anomalies: [], message: 'Insufficient data' };
            }

            const recent = volumes.slice(0, 30);
            const volumes_24h = recent.map(v => v.volume_24h);
            
            const mean = volumes_24h.reduce((a, b) => a + b, 0) / volumes_24h.length;
            const variance = volumes_24h.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / volumes_24h.length;
            const stdDev = Math.sqrt(variance);

            const anomalies = [];
            for (const vol of recent) {
                const zScore = (vol.volume_24h - mean) / stdDev;
                if (Math.abs(zScore) > threshold) {
                    anomalies.push({
                        date: vol.date,
                        volume: vol.volume_24h,
                        zScore,
                        type: zScore > 0 ? 'spike' : 'drop'
                    });
                }
            }

            return { anomalies, mean, stdDev, threshold };
        } catch (error) {
            logger.error('Failed to detect volume anomalies:', error.message);
            throw error;
        }
    }
}

export default new VolumeService();