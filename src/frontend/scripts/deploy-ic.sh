#!/bin/bash
set -e

echo "🚀 Deploying to Internet Computer mainnet..."
echo ""
echo "⚠️  IMPORTANT: Make sure you have:"
echo "   1. Selected the correct dfx identity (dfx identity use <name>)"
echo "   2. Sufficient cycles in your wallet"
echo "   3. Reviewed the code and are ready to deploy to production"
echo ""
read -p "Continue with deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Ensure we're in the project root
cd "$(dirname "$0")/../.."

# Check current identity
echo "📋 Current dfx identity:"
dfx identity whoami
echo ""

# Deploy to mainnet
echo "🌐 Deploying to mainnet (network: ic)..."
dfx deploy --network ic

# Get canister IDs
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Canister IDs:"
BACKEND_CANISTER_ID=$(dfx canister id backend --network ic)
FRONTEND_CANISTER_ID=$(dfx canister id frontend --network ic)

echo "   Backend:  $BACKEND_CANISTER_ID"
echo "   Frontend: $FRONTEND_CANISTER_ID"
echo ""
echo "🌍 Public URL:"
echo "   https://$FRONTEND_CANISTER_ID.icp0.io"
echo ""
echo "💡 Next steps:"
echo "   1. Update frontend/README.md with the canister IDs above"
echo "   2. Test the public URL to ensure the app loads correctly"
echo "   3. Verify mantra content loads from the backend"
echo ""
