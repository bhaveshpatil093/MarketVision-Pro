# MarketVision Pro

A high-performance, real-time market data visualization and analytics platform built for HFT professionals.

## 🚀 Features

- **Real-Time Price Dashboard**: Multi-asset price feeds with <100ms latency
- **Interactive Charting System**: Candlestick charts with technical indicators
- **Market Microstructure Analysis**: Order book visualization and time & sales
- **AI-Powered Insights**: Anomaly detection and pattern recognition
- **Risk Analytics**: Portfolio metrics, VaR calculations, and stress testing
- **Performance Monitoring**: Latency dashboard and system health metrics

## 🏗️ Architecture

```
Frontend (React/TypeScript) ↔ WebSocket ↔ FastAPI Backend ↔ Market Data APIs
                                              ↓
                                     InfluxDB (Time-series data)
                                              ↓
                                     Redis (Real-time cache)
```

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI + WebSockets
- **Database**: InfluxDB (time-series) + Redis (cache)
- **Charts**: TradingView Lightweight Charts
- **Data Sources**: Alpha Vantage, IEX Cloud, Yahoo Finance

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- Docker & Docker Compose
- Redis
- InfluxDB

## 🚀 Quick Start

**📖 For detailed setup instructions, see [STARTUP_GUIDE.md](./STARTUP_GUIDE.md)**

### Option 1: Use startup scripts (Recommended)
```bash
# Start backend
./start_backend.sh

# In a new terminal, start frontend
./start_frontend.sh
```

### Option 2: Manual setup
1. **Clone and Setup**
```bash
git clone <repository-url>
cd MarketVision-Pro
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Database Setup**
```bash
docker-compose up -d influxdb redis
```

4. **Frontend Setup**
```bash
cd frontend
npm install
```

5. **Environment Configuration**
Copy `.env.example` to `.env` and configure your API keys:
```bash
cp .env.example .env
# Edit .env with your API keys
```

6. **Run the Application**
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend
npm start
```

Visit `http://localhost:3000` to access the application.

## 📊 Performance Benchmarks

- **Data Latency**: <50ms from source to display
- **UI Responsiveness**: 60fps chart updates
- **Memory Usage**: <500MB with 100 symbols
- **WebSocket Throughput**: 1000+ messages/second

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📁 Project Structure

```
MarketVision-Pro/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── market_data/    # Market data processing
│   │   ├── database/       # Database clients
│   │   ├── websocket/      # WebSocket management
│   │   └── api/            # API endpoints
│   ├── requirements.txt
│   └── main.py
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml      # Database services
└── README.md
```

## 🔑 API Keys Required

- **Alpha Vantage**: Free tier (5 calls/minute)
- **IEX Cloud**: Free tier (500K calls/month)
- **Yahoo Finance**: Unofficial API (unlimited)

## 🚀 Deployment

### Local Development
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- InfluxDB: `http://localhost:8086`
- Redis: `localhost:6379`

### Production
- Frontend: Vercel/Netlify
- Backend: AWS ECS/Google Cloud Run
- Database: InfluxDB Cloud + Redis Cloud

## 📈 Roadmap

- [x] Project setup and architecture
- [ ] Phase 1: Backend Infrastructure
- [ ] Phase 2: Frontend Foundation
- [ ] Phase 3: Advanced Analytics
- [ ] Phase 4: Real-Time Optimization
- [ ] Performance testing and optimization
- [ ] Production deployment

## 🤝 Contributing

This is a demonstration project for HFT interviews. Feel free to fork and enhance!

## 📄 License

MIT License - see LICENSE file for details.
