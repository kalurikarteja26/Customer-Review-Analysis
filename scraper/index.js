import { Engine } from './core/engine.js';

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
            console.log(JSON.stringify(results));
        } else {
            const testUrl = args[0];
            const result = await Engine.processUrl(testUrl);
            console.log(JSON.stringify(result));
        }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

run();
