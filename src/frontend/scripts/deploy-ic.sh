#!/bin/bash
set -e

echo "🚀 Deploying to Internet Computer mainnet..."
echo ""
echo "⚠️  IMPORTANT: Make sure you have:"
echo "   1. Selected the correct dfx identity (dfx identity use <name>)"
echo "   2. Sufficient cycles in your wallet"
echo "   3. Reviewed the code and are ready to deploy to production"
echo "   4. Run './frontend/scripts/build.sh' to ensure clean build"
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
echo "⚠️  VERIFICATION REQUIRED:"
echo "   1. Open the URL above in a PRIVATE/INCOGNITO window (to avoid cache)"
echo "   2. Or use hard refresh (Ctrl+Shift+R / Cmd+Shift+R) in your browser"
echo "   3. Select 'Samaveda' from the Veda dropdown"
echo "   4. Verify that mantra numbers 47 and 48 appear in the dropdown"
echo "   5. Select mantra 47 and verify content loads (text, meaning, metadata)"
echo "   6. Select mantra 48 and verify content loads (text, meaning)"
echo ""
echo "💡 Next steps:"
echo "   1. Copy the canister IDs above"
echo "   2. Update frontend/README.md with these IDs"
echo "   3. Complete the verification checklist above"
echo "   4. If mantras 47/48 don't appear, check the diagnostics panel"
echo ""
echo "📋 For copy/paste into README.md:"
echo "   Frontend Canister: $FRONTEND_CANISTER_ID"
echo "   Backend Canister: $BACKEND_CANISTER_ID"
echo "   Public URL: https://$FRONTEND_CANISTER_ID.icp0.io"
echo ""
