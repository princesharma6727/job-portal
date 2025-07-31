#!/bin/bash

echo "🚀 Starting RizeOS Development Server with Hot Reloading..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install-all
fi

# Start development server
echo "🔥 Starting development server with hot reloading..."
echo "📱 Client will be available at: http://localhost:3000"
echo "🔧 Server will be available at: http://localhost:5000"
echo "🔄 Hot reloading is enabled for both client and server"
echo ""
echo "Press Ctrl+C to stop the development server"
echo ""

npm run dev 