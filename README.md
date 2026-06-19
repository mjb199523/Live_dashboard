# Dashboard

**Real-time global intelligence & crisis-monitoring dashboard** — a local-first, browser-based situational awareness tool for tracking geopolitical events, natural disasters, aviation, and market signals.

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

> No required API keys — the dashboard works out of the box with free and live data sources. Everything runs in 100% real-time.

---

## ✨ Features

- 🗺️ **Interactive WebGL Map** — deck.gl + MapLibre GL with 4 toggleable data layers
- 🔄 **8 Workspace Presets** — Crisis Desk, Supply Chain, Energy Security, News Desk, Markets, Tech Watch, Good News, Global Aviation
- 🌍 **Global Country Filtering** — Zoom into any country to instantly filter all dashboard panels
- 📰 **Live News Aggregation** — RSS feeds from BBC, Reuters, Al Jazeera, NPR, TechCrunch, and more
- 🔴 **Real-Time Data** — USGS earthquakes, GDACS disaster alerts, OpenSky flight tracking, ReliefWeb conflicts
- 📊 **Market Composite** — 6-signal gauge combining fear/greed, yields, credit spreads, and commodities via Yahoo Finance
- 🌙 **Command-Center Dark Theme** — Near-black background with neon green/cyan accents
- 💾 **Client-Side Caching** — localStorage + TTL to reduce API calls
- 🔌 **Graceful Fallbacks** — "No data" states instead of errors for resilient operation

---

## 🗂️ Workspaces

| Workspace | Description | Key Layers | Key Panels |
|-----------|-------------|------------|------------|
| 🔴 Crisis Desk | Conflict, posture, instability | Conflicts, Earthquakes, Disasters, Flights | News, Conflicts, Flights |
| 🚢 Supply Chain Risk | Routes, chokepoints, commodities | Conflicts | Commodities, News |
| ⚡ Energy Security | Commodities and energy news | (None) | Commodities |
| 📰 News Desk | Breaking news, advisories | Earthquakes, Disasters, Conflicts | News, Live Feeds, Conflicts |
| 📊 Markets | Quotes, macro signals | (None) | Markets, Commodities, News |
| 🤖 Tech Watch | AI, chips, cyber, regulation | Flights, Earthquakes | News, Live Feeds, Markets |
| 🌱 Good News | Progress, breakthroughs | Earthquakes | News, Markets |
| ✈️ Global Aviation | Live aircraft tracking | Flights, Earthquakes, Conflicts | Flights, News |

---

## 📡 Data Sources

| Source | API | Key Required? | Status |
|--------|-----|:------------:|:------:|
| USGS Earthquakes | `earthquake.usgs.gov` | ❌ | ✅ Real |
| GDACS Disasters | `gdacs.org/gdacsapi` | ❌ | ✅ Real |
| ReliefWeb Conflicts | `reliefweb.int/updates` | ❌ | ✅ Real |
| RSS News Feeds | BBC, Reuters, etc. | ❌ | ✅ Real |
| OpenSky Network | `opensky-network.org` | ⚠️ Optional | ✅ Real |
| Markets | `yahoo-finance2` | ❌ | ✅ Real |

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
        │  OpenSky · Yahoo Fin. │
        └───────────────────────┘
```

---

## 🔧 Environment Variables

All optional — see [.env.example](.env.example) for full documentation.

| Variable | Feature Unlocked |
|----------|-----------------|
| `OPENSKY_USERNAME` / `PASSWORD` | Higher OpenSky rate limits (1000/day) |
| `MAPTILER_KEY` | Premium dark map tiles |
| `NEWSAPI_KEY` | Expanded news headlines |
| `OLLAMA_URL` | Local LLM news summarization |

---

## 📁 Project Structure

```
dashboard/
├── server/              # Express backend
│   ├── index.ts         # Server entry
│   ├── cache.ts         # In-memory TTL cache
│   ├── cron.ts          # Scheduled refresh jobs
│   └── sources/         # Data fetchers
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
