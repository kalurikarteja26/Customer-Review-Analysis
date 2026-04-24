import { AmazonSearcher } from './searchers/AmazonSearcher.js';
import { FlipkartSearcher } from './searchers/FlipkartSearcher.js';
import playwright from 'playwright';

async function testTech() {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const query = 'laptop with rtx 4050';
    
    try {
        console.log('--- TESTING AMAZON ---');
        const amazon = new AmazonSearcher();
        const amzResults = await amazon.searchWithBrowser(page, query);
        console.log(amzResults.length ? amzResults.map(r => r.title) : "AMAZON FAILED");

        console.log('\n--- TESTING FLIPKART ---');
        const flipkart = new FlipkartSearcher();
        const fkResults = await flipkart.searchWithBrowser(page, query);
        console.log(fkResults.length ? fkResults.map(r => r.title) : "FLIPKART FAILED");
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

testTech();
