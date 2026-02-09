#!/bin/bash
set -e

echo "🔨 Starting clean production build..."

# Ensure we're in the project root
cd "$(dirname "$0")/../.."

# Clean previous builds and generated artifacts more thoroughly
echo "🧹 Cleaning previous builds and generated artifacts..."
rm -rf .dfx/local
rm -rf .dfx/ic
rm -rf frontend/dist
rm -rf frontend/src/declarations
rm -rf frontend/.vite

# Clean any cached backend bindings
echo "🧹 Cleaning backend bindings cache..."
rm -rf frontend/src/backend.d.ts.bak
rm -rf frontend/src/backend.js.bak

# Install dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd frontend && pnpm install && cd ..
fi

# Generate backend bindings from clean state
echo "🔗 Generating backend bindings..."
dfx generate backend

# Verify bindings were generated
if [ ! -f "frontend/src/backend.d.ts" ]; then
  echo "❌ Error: Backend bindings were not generated!"
  exit 1
fi

echo "✅ Backend bindings generated successfully"

# Build frontend
echo "🏗️  Building frontend..."
cd frontend && pnpm run build:skip-bindings && cd ..

# Build canisters
echo "📦 Building canisters..."
dfx build

echo ""
echo "✅ Build complete! Ready for deployment."
echo ""
echo "📋 Next steps:"
echo "   1. Review the build output above for any warnings"
echo "   2. Run './frontend/scripts/deploy-ic.sh' to deploy to mainnet"
echo "   3. Or run 'dfx deploy' to deploy locally for testing"
echo ""
