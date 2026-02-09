# Vedic Mantra Browser

A web application for exploring Vedic mantras across different Vedas and languages, built on the Internet Computer.

## Live Application

**Public URL:** `https://<frontend-canister-id>.icp0.io`

> **Note:** After deploying to mainnet, update the `<frontend-canister-id>` above with your actual frontend canister ID.

## Features

- Browse mantras from Rigveda, Yajurveda, Samaveda, and Atharvaveda
- View mantra text, meaning, and metadata in Telugu, English, and Hindi
- Audio playback and upload for select mantras (requires Internet Identity authentication)
- Deep-linkable URLs for sharing specific mantras
- Responsive design with light and dark mode support

## Canister IDs

After deployment, record your canister IDs here:

- **Frontend Canister:** `<frontend-canister-id>`
- **Backend Canister:** `<backend-canister-id>`

## Development

See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on deploying to the Internet Computer mainnet.

### Template Editor

The Mantra Content Template editor is hidden by default in production builds. To enable it:

**In Development:**
- The template editor is automatically visible when running `npm start` or in development mode.

**In Production:**
- Set the environment variable `VITE_ENABLE_TEMPLATE_EDITOR=true` to explicitly enable the template editor in production builds.
- By default, the template editor is hidden in production deployments for a cleaner user experience.

## Technology Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Motoko
- **Platform:** Internet Computer (ICP)
- **Authentication:** Internet Identity

## License

© 2026. Built with love using [caffeine.ai](https://caffeine.ai)
