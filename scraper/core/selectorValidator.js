/**
 * Selector Validator
 * Tracks consecutive failures of specific fields (like price or image) per platform.
 * If a platform consistently fails to extract key fields, it logs an alert
 * for "self-healing" or developer review.
 */
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'selector_health.json');

class SelectorValidator {
    constructor() {
        this.stats = {};
        this.loadStats();
    }

    loadStats() {
        try {
            if (fs.existsSync(LOG_FILE)) {
                const data = fs.readFileSync(LOG_FILE, 'utf8');
                this.stats = JSON.parse(data);
            }
        } catch (e) {
            console.error('[SelectorValidator] Failed to load stats:', e.message);
        }
    }

    saveStats() {
        try {
            fs.writeFileSync(LOG_FILE, JSON.stringify(this.stats, null, 2), 'utf8');
        } catch (e) {
            console.error('[SelectorValidator] Failed to save stats:', e.message);
        }
    }

    validate(platform, data) {
        if (!this.stats[platform]) {
            this.stats[platform] = {
                total_runs: 0,
                price_failures: 0,
                title_failures: 0,
                image_failures: 0,
                consecutive_failures: 0,
                degraded: false
            };
        }

        const pStats = this.stats[platform];
        pStats.total_runs++;

        let failed = false;

        if (!data.title) {
            pStats.title_failures++;
            failed = true;
        }
        if (!data.price) {
            pStats.price_failures++;
            failed = true;
        }
        if (!data.image) {
            pStats.image_failures++;
            failed = true;
        }

        if (failed) {
            pStats.consecutive_failures++;
            if (pStats.consecutive_failures >= 3 && !pStats.degraded) {
                pStats.degraded = true;
                console.error(`[CRITICAL] ${platform} scraper is DEGRADED. Selectors may have changed.`);
            }
        } else {
            // Reset consecutive failures on success
            if (pStats.consecutive_failures > 0) {
                pStats.consecutive_failures = 0;
            }
            if (pStats.degraded) {
                pStats.degraded = false;
                console.error(`[RECOVERY] ${platform} scraper has recovered.`);
            }
        }

        // Save asynchronously so we don't block
        setTimeout(() => this.saveStats(), 0);

        return data;
    }
}

export const selectorValidator = new SelectorValidator();
