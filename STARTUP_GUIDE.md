# MarketVision Pro - Startup Guide

## 🚀 Quick Start

This guide will help you get MarketVision Pro running on your local machine.

## 📋 Prerequisites

- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Docker & Docker Compose** - [Download here](https://docs.docker.com/get-docker/)

## 🗄️ Database Setup (Optional)

If you want to use the full database features:

```bash
# Start InfluxDB and Redis
docker-compose up -d influxdb redis

# Check if services are running
docker-compose ps
```

## 🔧 Backend Setup

### Option 1: Use the startup script (Recommended)
```bash
# From project root directory
./start_backend.sh
```

### Option 2: Manual setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your API keys (optional for testing)
# nano .env

# Start the server
python main.py
```

The backend will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **WebSocket**: ws://localhost:8000/ws/market-data

## 🎨 Frontend Setup

### Option 1: Use the startup script (Recommended)
```bash
# From project root directory
./start_frontend.sh
```

### Option 2: Manual setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at:
- **Application**: http://localhost:3000

## 🔑 API Keys (Optional)

For real market data, you'll need API keys:

1. **Alpha Vantage** (Free tier: 5 calls/minute)
   - Sign up: https://www.alphavantage.co/support/#api-key
   - Add to `.env`: `ALPHA_VANTAGE_API_KEY=your_key_here`

2. **IEX Cloud** (Free tier: 500K calls/month)
   - Sign up: https://iexcloud.io/cloud-login#/register
   - Add to `.env`: `IEX_CLOUD_API_KEY=your_key_here`

3. **Binance** (Free WebSocket data)
   - Add to `.env`: `BINANCE_API_KEY=your_key_here`

## 🚨 Common Issues & Solutions

### 1. "Disconnected from real-time data feed"
**Cause**: Backend server is not running
**Solution**: 
- Start the backend first: `./start_backend.sh`
- Check if backend is running: `curl http://localhost:8000/health`

### 2. "WebSocket connection error"
**Cause**: Backend WebSocket endpoint not accessible
**Solution**:
- Ensure backend is running on port 8000
- Check firewall settings
- Verify WebSocket endpoint: `ws://localhost:8000/ws/market-data`

### 3. "Module not found" errors
**Cause**: Dependencies not installed
**Solution**:
- Backend: `pip install -r requirements.txt`
- Frontend: `npm install`

### 4. Port already in use
**Cause**: Another service is using the port
**Solution**:
- Backend (8000): `lsof -ti:8000 | xargs kill -9`
- Frontend (3000): `lsof -ti:3000 | xargs kill -9`

### 5. Database connection errors
**Cause**: InfluxDB/Redis not running
**Solution**:
```bash
# Start databases
docker-compose up -d influxdb redis

# Check status
docker-compose ps
```

## 📱 Testing the Application

1. **Start Backend**: `./start_backend.sh`
2. **Start Frontend**: `./start_frontend.sh` (in a new terminal)
3. **Open Browser**: Navigate to http://localhost:3000
4. **Check Connection**: Look for green "Connected" status in the sidebar

## 🔍 Debugging

### Backend Logs
```bash
cd backend
source venv/bin/activate
python main.py --log-level debug
```

### Frontend Logs
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

### WebSocket Testing
```bash
# Test WebSocket connection
wscat -c ws://localhost:8000/ws/market-data

# Send test message
{"type": "ping"}
```

## 🚀 Production Deployment

For production deployment, see `DEPLOYMENT.md` in the project root.

## 📞 Support

If you encounter issues:
1. Check this guide
2. Review the logs
3. Check the GitHub issues
4. Create a new issue with detailed error information

---

**Happy Trading! 🎯📈**
