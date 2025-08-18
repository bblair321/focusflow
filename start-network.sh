#!/bin/bash

echo "🚀 Starting FocusFlow for Network Access..."
echo "🌐 Your computer's IP: 192.168.0.22"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""

# Start backend
echo "📡 Starting Flask backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/upgrade pip
pip install --upgrade pip

# Install requirements
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Start Flask in background
echo "🚀 Starting Flask server on 0.0.0.0:5000..."
flask run --host=0.0.0.0 --port=5000 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if ! curl -s http://localhost:5000/ > /dev/null; then
    echo "❌ Backend failed to start. Check the logs above."
    exit 1
fi

echo "✅ Backend is running on http://0.0.0.0:5000"
echo ""

# Start frontend
echo "🎨 Starting React frontend..."
cd ../frontend

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Start React in background
echo "🚀 Starting React development server on 0.0.0.0:3000..."
HOST=0.0.0.0 npm start &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

echo ""
echo "🎉 FocusFlow is now running and accessible from your network!"
echo ""
echo "📱 Access Points:"
echo "   Local (this computer):"
echo "     Frontend: http://localhost:3000"
echo "     Backend:  http://localhost:5000"
echo ""
echo "   Network (other computers):"
echo "     Frontend: http://192.168.0.22:3000"
echo "     Backend:  http://192.168.0.22:5000"
echo ""
echo "💡 Network Access Tips:"
echo "   - Make sure Windows Firewall allows connections on ports 3000 and 5000"
echo "   - Other computers must be on the same network (192.168.0.xxx)"
echo "   - If you can't connect, check Windows Firewall settings"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping FocusFlow..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Wait for user to stop
wait
