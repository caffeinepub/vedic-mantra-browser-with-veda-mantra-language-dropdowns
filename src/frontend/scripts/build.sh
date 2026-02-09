#!/bin/bash
set -e

echo "🔨 Starting clean production build..."

# Ensure we're in the project root
cd "$(dirname "$0")/../.."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .dfx/local
rm -rf frontend/dist

# Install dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd frontend && pnpm install && cd ..
fi

# Generate backend bindings
echo "🔗 Generating backend bindings..."
dfx generate backend

# Build frontend
echo "🏗️  Building frontend..."
cd frontend && pnpm run build:skip-bindings && cd ..

# Build canisters
echo "📦 Building canisters..."
dfx build

echo "✅ Build complete! Ready for deployment."
