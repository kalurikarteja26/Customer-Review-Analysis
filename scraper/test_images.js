import { SnapdealSearcher } from './searchers/SnapdealSearcher.js';
import { AjioSearcher } from './searchers/AjioSearcher.js';
import playwright from 'playwright';

async function testImages() {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const query = 'sunscreen';
    
    try {
        console.log('--- TESTING SNAPDEAL ---');
        const snapdeal = new SnapdealSearcher();
        const sdResults = await snapdeal.searchWithBrowser(page, query);
        console.log(JSON.stringify(sdResults.map(r => ({ title: r.title, img: r.image })), null, 2));

        console.log('\n--- TESTING AJIO ---');
        const ajio = new AjioSearcher();
        const ajioResults = await ajio.searchWithBrowser(page, query);
        console.log(JSON.stringify(ajioResults.map(r => ({ title: r.title, img: r.image })), null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

testImages();
