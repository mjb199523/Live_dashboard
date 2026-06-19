# Dashboard

**Real-time global intelligence & crisis-monitoring dashboard** — a local-first, browser-based situational awareness tool for tracking geopolitical events, natural disasters, energy infrastructure, and market signals.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-purple?logo=vite)
![React](https://img.shields.io/badge/React-18.3-cyan?logo=react)
![deck.gl](https://img.shields.io/badge/deck.gl-9.3-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ⚡ Quick Start

```bash
# Clone and install
git clone <your-repo-url>
cd dashboard
npm install

# Start development (frontend + backend concurrently)
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health check**: http://localhost:3001/api/health

> No required API keys — the dashboard works out of the box with free data sources + demo data fallbacks.

---

## ✨ Features

- 🗺️ **Interactive WebGL Map** — deck.gl + MapLibre GL with 9 toggleable data layers
- 🔄 **7 Workspace Presets** — Crisis Desk, Supply Chain, Energy Security, News Desk, Markets, Tech Watch, Good News
- 🌡️ **Country Instability Index (CII)** — Composite 0-100 score for 60 countries with 5 weighted dimensions
- 📰 **Live News Aggregation** — RSS feeds from BBC, Reuters, Al Jazeera, NPR, TechCrunch, and more
- 🔴 **Real-Time Data** — USGS earthquakes, GDACS disaster alerts, OpenSky flight tracking
- ⚡ **Energy Infrastructure** — Pipeline status, storage facilities, port/chokepoint data
- 📊 **Market Composite** — 7-signal gauge combining fear/greed, yields, credit spreads, and more
- 🌙 **Command-Center Dark Theme** — Near-black background with neon green/cyan accents
- 💾 **Client-Side Caching** — localStorage + TTL to reduce API calls
- 🔌 **Graceful Fallbacks** — Demo data for premium feeds, "no data" states instead of errors

---

## 🗂️ Workspaces

| Workspace | Description | Key Layers | Key Panels |
|-----------|-------------|------------|------------|
| 🔴 Crisis Desk | Conflict, posture, instability | Conflicts, CII, Flights, Earthquakes | News, Conflicts, Flights, CII |
| 🚢 Supply Chain Risk | Routes, chokepoints, commodities | Ports, Pipelines, CII | Pipelines, Ports, Fuel Shortages |
| ⚡ Energy Security | Pipelines, storage, outages | Pipelines, Storage, Ports | Pipelines, Storage, Ticker |
| 📰 News Desk | Breaking news, advisories | Earthquakes, Disasters, Wildfires | News, Live Feeds |
| 📊 Markets | Quotes, macro signals | Ports, Pipelines, CII | Markets, Fuel Shortages |
| 🤖 Tech Watch | AI, chips, cyber, regulation | Flights, Earthquakes | News, Markets |
| 🌱 Good News | Progress, breakthroughs | Wildfires, Storage | News, Storage |

---

## 📡 Data Sources

| Source | API | Key Required? | Status |
|--------|-----|:------------:|:------:|
| USGS Earthquakes | `earthquake.usgs.gov` | ❌ | ✅ Real |
| GDACS Disasters | `gdacs.org/gdacsapi` | ❌ | ✅ Real |
| RSS News Feeds | BBC, Reuters, etc. | ❌ | ✅ Real |
| OpenSky Network | `opensky-network.org` | ⚠️ Optional | ✅ Real |
| NASA FIRMS Wildfires | `firms.modaps.eosdis.nasa.gov` | ⚠️ Free key | ⚡ Real (with key) |
| Conflicts & Protests | — | — | 🔶 Demo |
| Oil & Gas Pipelines | — | — | 🔶 Demo |
| Markets | — | — | 🔶 Demo |
| Storage Facilities | — | — | 🔶 Demo |
| Ports & Chokepoints | — | — | 🔶 Demo |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│  Browser (Vite :5173)                    │
│  ┌────────┐  ┌─────────┐  ┌──────────┐  │
│  │ React  │  │ deck.gl │  │ Zustand  │  │
│  │ + TSX  │  │ MapLibre│  │ + Cache  │  │
│  └───┬────┘  └─────────┘  └──────────┘  │
│      │  fetch /api/*                     │
└──────┼───────────────────────────────────┘
       │
┌──────┼───────────────────────────────────┐
│  Express API Server (:3001)              │
│  ┌────────┐  ┌──────────┐  ┌─────────┐  │
│  │ Routes │  │ Sources  │  │  Cache  │  │
│  │        │──│ Fetchers │──│  (TTL)  │  │
│  └────────┘  └────┬─────┘  └─────────┘  │
│                   │                      │
│  ┌────────────────┼───────────────────┐  │
│  │  node-cron scheduled refreshes     │  │
│  └────────────────┼───────────────────┘  │
└───────────────────┼──────────────────────┘
                    │
        ┌───────────┴───────────┐
        │  External Free APIs   │
        │  USGS · GDACS · RSS   │
        │  OpenSky · NASA FIRMS │
        └───────────────────────┘
```

---

## 🔧 Environment Variables

All optional — see [.env.example](.env.example) for full documentation.

| Variable | Feature Unlocked |
|----------|-----------------|
| `FIRMS_MAP_KEY` | NASA FIRMS wildfire hotspot data |
| `OPENSKY_USERNAME` / `PASSWORD` | Higher OpenSky rate limits (1000/day) |
| `MAPTILER_KEY` | Premium dark map tiles |
| `NEWSAPI_KEY` | Expanded news headlines |
| `ALPHA_VANTAGE_KEY` | Real market data |
| `OLLAMA_URL` | Local LLM news summarization |

---

## 📁 Project Structure

```
dashboard/
├── server/              # Express backend
│   ├── index.ts         # Server entry
│   ├── cache.ts         # In-memory TTL cache
│   ├── cii.ts           # Country Instability Index
│   ├── cron.ts          # Scheduled refresh jobs
│   └── sources/         # Data fetchers + mock data
├── src/                 # React frontend
│   ├── components/      # UI components
│   │   ├── panels/      # Data panel components
│   │   ├── MapView.tsx   # deck.gl + MapLibre
│   │   └── ...
│   ├── config/          # Workspace + layer definitions
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand state management
│   └── utils/           # Formatting utilities
├── .github/workflows/   # CI/CD
├── .env.example         # Environment variable docs
└── package.json
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Development Tips

- **Adding a new data source**: Create a fetcher in `server/sources/`, add a route in `server/index.ts`, create a panel in `src/components/panels/`
- **Adding a new map layer**: Add entry in `src/config/layers.ts`, create layer factory in `MapView.tsx`
- **Adding a new workspace**: Add preset in `src/config/workspaces.ts`

---

## 📄 License

[MIT](LICENSE) — free for personal and commercial use.
