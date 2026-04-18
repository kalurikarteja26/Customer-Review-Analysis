# Sentix-Prime Global Intelligence

A production-ready, AI-driven product intelligence platform that analyzes any Amazon product URL to provide real-time sentiment analysis, historical audits, predictive sales forecasting, and an agentic customer service module.

## Features

- **Auto-Category Detection** — Paste any Amazon URL; the backend automatically detects if it's Shoes, Electronics, or Apparel.
- **Dynamic Dashboard** — Category-adaptive UI: Shoes shows Sole Comfort / Breathability / Weight; Electronics shows Battery Life / Processor Speed / Warranty.
- **Geospatial Currency (DCC)** — IP-based currency detection converts the base INR price into the user's local currency (USD/GBP/EUR/etc.) using live mid-market exchange rates.
- **Interactive Image Gallery** — 4-slot vertical thumbnail strip (Profile, Top, Heel, Sole views) with hero-mapped sync and smooth transitions.
- **Historical Trend Charts** — 10–15 point ascending sentiment trend powered by Recharts.
- **Predictive Sales Velocity** — Demand forecast graph that trends downward if live sentiment < historical average.
- **Agentic Customer Service** — Context-aware AI draft responses per review (e.g., mentions EVA Sole Technology for shoe complaints).
- **Live Pulse Feed** — Real-time review stream with Sending... → Success feedback.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Recharts, Framer Motion, Zustand |
| Backend | FastAPI, BeautifulSoup4, Pydantic, Uvicorn |
| State | Zustand global store |
| Currency | ip-api.com (geolocation) + open.er-api.com (live rates) |

## Getting Started

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
# API runs at http://127.0.0.1:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### 3. Or run both together (Windows)

```bash
.\start_and_tunnel.bat
```

## Usage

1. Open `http://localhost:5173`
2. Paste an Amazon product URL (e.g., an ASIAN Powerplay shoe link)
3. Click **MOUNT STREAM** — the Sentinel auto-detects the category
4. Explore the live intelligence dashboard

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/fetch-product-intelligence` | POST | Scrapes product + generates full intelligence payload |
| `/draft-response` | POST | Generates context-aware AI customer service reply |
| `/detect-currency` | GET | IP geolocation + live exchange rate detection |
