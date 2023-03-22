## PetProof - Milestone 2

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

This project requires a Fauna DB, Infura IPFS Keys, a custodial Testnet XRPL Wallet and XUMM Developer Keys. The following environmental variables must be added:

NEXT_PUBLIC_IPFS_SECRET=xxx
NEXT_PUBLIC_IPFS_KEY=xxx
NEXTAUTH_URL=http://localhost:3000
custodialWalletAddress=xxx
custodialWalletSecret=xxx
testUserWalletAddress=xxx
faunaKey=xxx
XummKey=xxx
XummPrivateKey=xxx
xrplCustodialAccount=xxx
xrplCustodialSecret=xxx
staticApiKey=xxx
web3storage_key=xxx

