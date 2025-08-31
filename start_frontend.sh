#!/bin/bash

echo "🎨 Starting MarketVision Pro Frontend..."
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Please run this script from the project root directory."
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting React development server..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   Make sure the backend is running at http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"

npm start
