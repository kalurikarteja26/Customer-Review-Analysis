import axios from 'axios';

const urls = [
    "https://www.amazon.in/ASIAN-Powerplay-01-Running-Walking-Technology/dp/B08V8W3K9K",
    "https://www.amazon.in/Samsung-Galaxy-Ultra-Storage-Graphite/dp/B0BW8N3X6D",
    "https://www.amazon.in/Sony-WH-1000XM4-Bluetooth-Headphones-Cancellation/dp/B0863TXGM3"
];

async function stressTest() {
    console.log("Starting Stress Test: Sequential Analysis...");
    
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`\n[${i + 1}/${urls.length}] Analyzing: ${url}`);
        
        try {
            const start = Date.now();
            const response = await axios.post("http://localhost:8000/fetch-product-intelligence", { url });
            const end = Date.now();
            
            if (response.data.success) {
                console.log(`✅ Success in ${((end - start) / 1000).toFixed(2)}s`);
                console.log(`Title: ${response.data.title.substring(0, 50)}...`);
            } else {
                console.log(`❌ Backend reported failure: ${response.data.error}`);
            }
        } catch (error) {
            console.log(`❌ Request crashed: ${error.message}`);
        }
    }
    
    console.log("\nStress Test Complete.");
}

stressTest();
