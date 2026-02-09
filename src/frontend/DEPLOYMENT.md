# Deployment Guide - Internet Computer Mainnet

This guide explains how to deploy the Vedic Mantra Browser to the Internet Computer mainnet for public access.

## Prerequisites

1. **DFX CLI installed** - Install the DFINITY Canister SDK:
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. **Cycles wallet** - You need cycles to deploy to mainnet. Get cycles from:
   - [Cycles Faucet](https://faucet.dfinity.org/) (for testing)
   - [NNS Dapp](https://nns.ic0.app/) (convert ICP to cycles)

3. **Internet Identity** - Create an identity at [https://identity.ic0.app/](https://identity.ic0.app/)

## Deployment Steps

### 1. Configure for Mainnet

Ensure your `dfx.json` is configured correctly. The default configuration should work for mainnet deployment.

### 2. Create Mainnet Identity (if needed)

