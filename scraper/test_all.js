import { AmazonSearcher } from './searchers/AmazonSearcher.js';
import { FlipkartSearcher } from './searchers/FlipkartSearcher.js';
import { AjioSearcher } from './searchers/AjioSearcher.js';
import { MyntraSearcher } from './searchers/MyntraSearcher.js';
import { SnapdealSearcher } from './searchers/SnapdealSearcher.js';
import { MeeshoSearcher } from './searchers/MeeshoSearcher.js';
import playwright from 'playwright';

async function testAll() {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const query = 'sunscreen';
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

    const searchers = [
        new AmazonSearcher(ua),
        new FlipkartSearcher(ua),
        new AjioSearcher(ua),
        new MyntraSearcher(ua),
        new SnapdealSearcher(ua),
        new MeeshoSearcher(ua)
    ];

    for (const s of searchers) {
        console.log(`\n--- TESTING ${s.constructor.name} ---`);
        try {
            const results = await s.searchWithBrowser(page, query);
            console.log(results.length ? results.map(r => r.title) : "FAILED OR EMPTY");
        } catch (e) {
            console.error(e.message);
        }
    }
    await browser.close();
}

testAll();
