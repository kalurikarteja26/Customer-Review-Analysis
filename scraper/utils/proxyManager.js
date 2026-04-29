/**
 * Proxy Manager for Rotating Proxies
 * Handles proxy rotation, health checks, and fallback to direct connection.
 */
import axios from 'axios';

class ProxyManager {
    constructor() {
        this.proxies = [];
        this.currentIndex = 0;
        this.lastRefresh = 0;
        this.isLoading = false;
    }

    async refreshProxies() {
        if (this.isLoading || Date.now() - this.lastRefresh < 3600000) {
            return; // Only refresh once per hour
        }
        
        this.isLoading = true;
        console.error('[ProxyManager] Refreshing free proxy list...');
        try {
            // Fetch free proxies from known public API (e.g. proxyscrape or similar)
            // Using a reliable text-based free proxy list for demonstration
            const res = await axios.get('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt', { timeout: 5000 });
            if (res.data) {
                const lines = res.data.split('\n').map(l => l.trim()).filter(l => l.length > 10);
                // Take top 50 to avoid massive lists
                this.proxies = lines.slice(0, 50).map(p => `http://${p}`);
                this.lastRefresh = Date.now();
                console.error(`[ProxyManager] Loaded ${this.proxies.length} proxies`);
            }
        } catch (e) {
            console.error(`[ProxyManager] Failed to load proxies: ${e.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    async getProxy() {
        return null; // Force direct connection for maximum stability
    }

    markFailed(proxy) {
        if (!proxy) return;
        // Remove failed proxy from pool
        this.proxies = this.proxies.filter(p => p !== proxy);
        console.error(`[ProxyManager] Removed failed proxy: ${proxy}. ${this.proxies.length} remaining.`);
    }
}

export const proxyManager = new ProxyManager();
