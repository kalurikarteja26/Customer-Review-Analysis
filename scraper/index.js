// Redirect console.log to stderr to keep stdout clean for JSON output
const originalLog = console.log;
console.log = (...args) => console.error(...args);

import { Engine } from './core/engine.js';

// Ignore Playwright stealth plugin close session errors to prevent crash
process.on('uncaughtException', (err) => {
    if (err.message.includes('cdpSession.send')) return;
    console.error('Uncaught Exception:', err.message);
});

async function run() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Error: Invalid arguments");
        process.exit(1);
    }

    try {
        if (args[0] === "--search") {
            const query = args.slice(1).join(" ");
            const results = await Engine.search(query);
            process.stdout.write(JSON.stringify(results) + '\n');
        } else {
            const testUrl = args[0];
            const result = await Engine.processUrl(testUrl);
            process.stdout.write(JSON.stringify(result) + '\n');
        }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

run();
