/**
 * Volume Data Mapper
 * Maps raw volume data to standardized format
 */

import logger from '../../binance_api/eth_price_n_ohlcv_data_api/utils/logger.js';

class VolumeMapper {
    constructor() {
        this.schema = {
            required: ['date', 'symbol', 'volume_24h', 'source'],
            optional: ['volume_change_24h', 'avg_volume_7d', 'avg_volume_30d', 'volume_rank']
        };
    }

    /**
     * Map raw data to standardized volume format
     */
    mapToStandard(rawData, provider) {
        try {
            let mapped = {};

            switch (provider) {
                case 'binance':
                    mapped = this.mapBinance(rawData);
                    break;
                case 'coingecko':
                    mapped = this.mapCoinGecko(rawData);
                    break;
                case 'cryptocompare':
                    mapped = this.mapCryptoCompare(rawData);
                    break;
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }

            // Validate mapped data
            this.validate(mapped);

            return mapped;
        } catch (error) {
            logger.error(`Failed to map volume data from ${provider}:`, error.message);
            throw error;
        }
    }

    /**
     * Map Binance volume data
     */
    mapBinance(raw) {
        return {
            date: raw.date || new Date().toISOString().split('T')[0],
            symbol: raw.symbol || 'ETH',
            volume_24h: raw.volume_24h || raw.volume || 0,
            volume_change_24h: raw.volume_change_24h || 0,
            avg_volume_7d: raw.avg_volume_7d || raw.volume_24h * 7 || 0,
            avg_volume_30d: raw.avg_volume_30d || raw.volume_24h * 30 || 0,
            volume_rank: raw.volume_rank || 0,
            source: 'binance',
            raw_data: raw.raw || raw
        };
    }

    /**
     * Map CoinGecko volume data
     */
    mapCoinGecko(raw) {
        return {
            date: raw.date || new Date().toISOString().split('T')[0],
            symbol: raw.symbol || 'ETH',
            volume_24h: raw.volume_24h || 0,
            volume_change_24h: raw.volume_change_24h || 0,
            avg_volume_7d: raw.avg_volume_7d || 0,
            avg_volume_30d: raw.avg_volume_30d || 0,
            volume_rank: raw.volume_rank || 0,
            source: 'coingecko',
            raw_data: raw.raw || raw
        };
    }

    /**
     * Map CryptoCompare volume data
     */
    mapCryptoCompare(raw) {
        return {
            date: raw.date || new Date().toISOString().split('T')[0],
            symbol: raw.symbol || 'ETH',
            volume_24h: raw.volume_24h || 0,
            volume_change_24h: raw.volume_change_24h || 0,
            avg_volume_7d: raw.avg_volume_7d || 0,
            avg_volume_30d: raw.avg_volume_30d || 0,
            volume_rank: raw.volume_rank || 0,
            source: 'cryptocompare',
            raw_data: raw.raw || raw
        };
    }

    /**
     * Merge multiple provider volumes
     */
    mergeVolumes(volumes) {
        const merged = {
            date: volumes[0]?.date || new Date().toISOString().split('T')[0],
            symbol: volumes[0]?.symbol || 'ETH',
            volume_24h: 0,
            volume_change_24h: 0,
            avg_volume_7d: 0,
            avg_volume_30d: 0,
            volume_rank: 0,
            sources: [],
            confidence: 0
        };

        let totalWeight = 0;
        const weights = {
            binance: 0.5,
            coingecko: 0.3,
            cryptocompare: 0.2
        };

        for (const vol of volumes) {
            if (vol && vol.volume_24h > 0) {
                const weight = weights[vol.source] || 0.1;
                merged.volume_24h += vol.volume_24h * weight;
                merged.volume_change_24h += vol.volume_change_24h * weight;
                merged.avg_volume_7d += vol.avg_volume_7d * weight;
                merged.avg_volume_30d += vol.avg_volume_30d * weight;
                merged.sources.push(vol.source);
                totalWeight += weight;
            }
        }

        if (totalWeight > 0) {
            merged.volume_24h /= totalWeight;
            merged.volume_change_24h /= totalWeight;
            merged.avg_volume_7d /= totalWeight;
            merged.avg_volume_30d /= totalWeight;
            merged.confidence = totalWeight;
        }

        return merged;
    }

    /**
     * Calculate volume rankings
     */
    calculateRanking(volumes, symbol = 'ETH') {
        if (!volumes || volumes.length === 0) return 0;
        const sorted = [...volumes].sort((a, b) => b.volume_24h - a.volume_24h);
        const rank = sorted.findIndex(v => v.symbol === symbol) + 1;
        return rank;
    }

    /**
     * Validate volume data
     */
    validate(data) {
        for (const field of this.schema.required) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        const numericFields = ['volume_24h', 'volume_change_24h', 'avg_volume_7d', 'avg_volume_30d'];
        for (const field of numericFields) {
            if (data[field] !== undefined && typeof data[field] !== 'number') {
                data[field] = parseFloat(data[field]) || 0;
            }
        }

        if (data.volume_24h < 0) data.volume_24h = 0;

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(data.date)) {
            try {
                const d = new Date(data.date);
                data.date = d.toISOString().split('T')[0];
            } catch (error) {
                throw new Error(`Invalid date format: ${data.date}`);
            }
        }

        return true;
    }

    /**
     * Calculate confidence score for volume data
     */
    calculateConfidence(volume) {
        let score = 0;
        const sourceWeights = { binance: 0.95, coingecko: 0.85, cryptocompare: 0.80 };
        score += sourceWeights[volume.source] || 0.5;

        const completeness = ['volume_24h', 'avg_volume_7d', 'volume_change_24h']
            .filter(f => volume[f] !== undefined && volume[f] !== null).length / 3;
        score += completeness * 0.2;

        if (volume.volume_24h > 0) {
            const volumeLevel = Math.log10(volume.volume_24h);
            const reasonableness = Math.min(1, volumeLevel / 10);
            score += reasonableness * 0.1;
        }

        return Math.min(1, score);
    }
}

export default new VolumeMapper();