import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use stealth plugin
chromium.use(stealthPlugin());

export class BrowserManager {
    static browser = null;

    static async getBrowser() {
        if (!this.browser) {
            console.log("[BrowserManager] Launching new Chromium instance (Playwright Extra)...");
            this.browser = await chromium.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled'
                ]
            });
        }
        return this.browser;
    }

    static async createPage(ua) {
        const browser = await this.getBrowser();
        const context = await browser.newContext({
            userAgent: ua,
            viewport: { width: 1280, height: 800 },
            deviceScaleFactor: 1,
        });
        
        const page = await context.newPage();

        // Block heavy resources to drastically improve speed
        await page.route('**/*', (route) => {
            const type = route.request().resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        return page;
    }

    static async cleanup() {
        if (this.browser) {
            console.log("[BrowserManager] Closing browser...");
            await this.browser.close();
            this.browser = null;
        }
    }
}
