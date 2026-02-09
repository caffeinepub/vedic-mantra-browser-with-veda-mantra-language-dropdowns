# Vedic Mantra Browser

A web application for exploring Vedic mantras across different Vedas and languages, built on the Internet Computer.

## Live Application

**Public URL:** `https://<frontend-canister-id>.icp0.io`

> **Note:** After deploying to mainnet, update the `<frontend-canister-id>` above with your actual frontend canister ID from the deployment output.

## Features

- Browse mantras from Rigveda, Yajurveda, Samaveda, and Atharvaveda
- View mantra text, meaning, and metadata in Telugu, English, and Hindi
- Audio playback and upload for select mantras (requires Internet Identity authentication)
- Deep-linkable URLs for sharing specific mantras (e.g., `/samaveda/47`)
- Responsive design with light and dark mode support
- Real-time backend diagnostics for data verification

## Canister IDs

After deployment, record your canister IDs here (from `./frontend/scripts/deploy-ic.sh` output):

- **Frontend Canister:** `<frontend-canister-id>`
- **Backend Canister:** `<backend-canister-id>`

## Development

### Local Development

