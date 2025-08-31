#!/bin/bash

echo "🚀 Starting MarketVision Pro Backend..."
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend/main.py" ]; then
    echo "❌ Please run this script from the project root directory."
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
        echo "📝 Please edit .env file with your API keys before starting the server"
        echo "   You can get free API keys from:"
        echo "   - Alpha Vantage: https://www.alphavantage.co/support/#api-key"
        echo "   - IEX Cloud: https://iexcloud.io/cloud-login#/register"
        echo ""
        echo "Press Enter to continue or Ctrl+C to edit .env first..."
        read
    else
        echo "❌ .env.example not found. Please create a .env file manually."
        exit 1
    fi
fi

# Start the server
echo "🌐 Starting FastAPI server..."
echo "   Backend will be available at: http://localhost:8000"
echo "   API docs will be available at: http://localhost:8000/docs"
echo "   WebSocket endpoint: ws://localhost:8000/ws/market-data"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"

python main.py
