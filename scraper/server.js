import express from 'express';
import cors from 'cors';
import { Engine } from './core/engine.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Search API (Multi-platform)
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        console.log(`[Scraper API] Searching for: ${query}`);
        const results = await Engine.search(query);
        res.json(results);
    } catch (error) {
        console.error(`[Scraper API] Search Error:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// Deep-Dive Process API
app.post('/process', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL body parameter is required' });
    }

    try {
        console.log(`[Scraper API] Processing URL: ${url}`);
        const result = await Engine.processUrl(url);
        res.json(result);
    } catch (error) {
        console.error(`[Scraper API] Process Error:`, error.message);
        if (error.message.includes('Unsupported website')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`[Scraper API] Microservice listening on port ${port}`);
});
