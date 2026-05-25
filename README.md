# SentientWallet 🧠💰

> An AI-Powered Autonomous Treasury Management System for DeFi

SentientWallet is a next-generation DeFi portfolio manager that uses autonomous AI agents to optimize yield, manage risk, and execute transactions across multiple blockchain networks. Built with Intent-Centric UX and powered by Google's Gemini AI.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.17.0-brightgreen.svg)
![Python](https://img.shields.io/badge/python-%3E%3D3.10-blue.svg)

## 🌟 Features

### 🤖 Autonomous AI Agent
- **Sentient-Alpha**: High-frequency treasury management with chain-of-thought reasoning
- **Perception Loop**: Continuous market analysis every 5 minutes
- **Risk-Aware Decision Making**: Automatic risk auditing and constraint checking
- **Multi-Chain Support**: Ethereum, Arbitrum, Polygon, and Optimism

### 🎨 Agentic Dashboard
- **Intelligence Feed**: Real-time reasoning cards showing AI thought process
- **Command Bar**: Voice and text commands for natural interaction
- **3D Asset Orb**: Visual health indicator with real-time status
- **Live Terminal**: Streaming AI logs and debugging interface
- **Kill Switch**: Emergency stop with one-click permission revocation

### 🛡️ Safety & Guardrails
- **Autonomous/Manual Modes**: Toggle between full automation and approval-required
- **Budget Limits**: Set daily spending caps and max gas prices
- **Protocol Whitelist**: Control which DeFi protocols AI can access
- **Risk Management**: Configurable risk tolerance and drawdown limits
- **Transaction Simulation**: Pre-execution testing via Tenderly API

### 💎 DeFi Integration
- **Protocol Support**: Aave, Uniswap V3, Curve, Lido
- **Yield Optimization**: Automatic rebalancing for maximum APY
- **Gas Optimization**: Smart transaction timing and batching
- **Multi-Sig Support**: Safe (Gnosis Safe) integration with session keys

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 15)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Dashboard│  │ Command  │  │ Guardrail│  │  3D Orb │ │
│  │   Feed   │  │   Bar    │  │  Sidebar │  │ Terminal│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                    WebSocket (Socket.IO)
                            │
┌─────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   API    │  │WebSocket │  │  Logic   │  │ Blockchain│ │
│  │  Routes  │  │ Service  │  │   Gate   │  │  Service │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                       HTTP/REST API
                            │
┌─────────────────────────────────────────────────────────┐
│            AI Engine (Python + FastAPI)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Sentient │  │ Perception│  │   DeFi   │  │ Gemini  │ │
│  │   Agent  │  │   Loop   │  │   Tools  │  │   LLM   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                  External Services                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Blockchain│  │ DeFiLlama│  │ Tenderly │  │  Safe   │ │
│  │    RPCs   │  │   API    │  │   API    │  │ Multi-sig│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.17.0
- **Python** >= 3.10
- **PostgreSQL** >= 14
- **Redis** >= 6.2 (optional, for production)
- **npm** >= 9.0.0 or **yarn** >= 1.22.0

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/SentientWallet.git
cd SentientWallet
```

### 2. Setup Frontend

```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 3. Setup Backend

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration (see Configuration section below)

# Setup database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

Backend will be available at `http://localhost:3001`

### 4. Setup AI Engine

```bash
cd ai-engine

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your Gemini API key

# Start server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

AI Engine will be available at `http://localhost:8000`

## ⚙️ Configuration

### Required API Keys

1. **Gemini AI** (Required)
   - Get from: https://makersuite.google.com/app/apikey
   - Set: `GEMINI_API_KEY` in `ai-engine/.env`

2. **Alchemy/Infura** (Required for blockchain)
   - Alchemy: https://dashboard.alchemy.com/
   - Infura: https://infura.io/
   - Set: `ALCHEMY_API_KEY` or `INFURA_API_KEY` in `backend/.env`

3. **Tenderly** (Optional - for transaction simulation)
   - Get from: https://dashboard.tenderly.co/
   - Set: `TENDERLY_API_KEY`, `TENDERLY_ACCOUNT_ID`, `TENDERLY_PROJECT_ID`

4. **Database** (Required)
   ```bash
   # PostgreSQL connection string
   DATABASE_URL=postgresql://username:password@localhost:5432/sentientwallet
   ```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://localhost:5432/sentientwallet
ALCHEMY_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
TENDERLY_API_KEY=your_key_here
JWT_SECRET=change_in_production
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

#### AI Engine (.env)
```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-pro
HOST=0.0.0.0
PORT=8000
```

## 📖 Usage

### 1. Connect Your Wallet

Click "Connect Wallet" and approve the connection with MetaMask, WalletConnect, or any Web3 wallet.

### 2. Configure Guardrails

- **Operating Mode**: Toggle between Autonomous and Manual Approval
- **Budget Limits**: Set daily spending limits and max gas prices
- **Protocol Whitelist**: Enable/disable specific DeFi protocols
- **Risk Settings**: Configure target APY and max drawdown

### 3. Interact with AI

#### Text Commands
```
"Optimize my portfolio for maximum yield"
"Reduce risk exposure by 10%"
"Harvest all rewards"
"Move 50 ETH to Aave for lending"
```

#### Voice Commands
Click the microphone icon and speak naturally:
- "What are my best yield opportunities?"
- "Execute emergency exit"
- "Rebalance my portfolio"

### 4. Monitor Activity

- **Intelligence Feed**: Watch AI reasoning in real-time
- **Log Terminal**: See detailed execution logs
- **Asset Orb**: Visual health indicator (Blue=Good, Red=Critical)

### 5. Emergency Stop

Click the red **Kill Switch** button to immediately:
- Revoke all AI permissions
- Cancel pending transactions
- Stop autonomous operations

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:watch  # Watch mode
```

### Backend Tests
```bash
cd backend
npm run test
npm run test:coverage
```

### AI Engine Tests
```bash
cd ai-engine
pytest
pytest --cov=src  # With coverage
```

## 📦 Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

**Environment Variables to Set:**
- `NEXT_PUBLIC_API_URL` - Your backend URL
- `NEXT_PUBLIC_WS_URL` - Your WebSocket URL
- `NEXT_PUBLIC_ALCHEMY_API_KEY`

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your repository
3. Configure:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Add all environment variables

### AI Engine (Render/Railway)

1. Create a new Web Service
2. Configure:
   - **Build Command**: `cd ai-engine && pip install -r requirements.txt`
   - **Start Command**: `cd ai-engine && uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Add Gemini API key and other variables

### Database

**Production Options:**
- Supabase (PostgreSQL)
- Railway (PostgreSQL)
- AWS RDS
- Digital Ocean Managed Database

## 🔐 Security

### Best Practices

1. **Never commit `.env` files** - Use `.env.example` templates
2. **Use AWS KMS** for production key storage (not hardcoded keys)
3. **Enable Rate Limiting** - Already configured in backend
4. **Use HTTPS** - Always in production
5. **Audit Smart Contracts** - Before mainnet deployment
6. **Test on Testnet** - Goerli, Sepolia before mainnet
7. **Session Keys** - Use Safe multi-sig with limited session keys

### Security Checklist

- [ ] All API keys in environment variables
- [ ] JWT secret changed from default
- [ ] Database has strong password
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS/WSS in production
- [ ] Session keys properly encrypted
- [ ] Smart contracts audited

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Basic AI agent with Gemini
- [x] Intelligence feed UI
- [x] Command bar with voice
- [x] Guardrail controls
- [x] WebSocket real-time updates
- [x] Kill switch

### Phase 2 (Q2 2024)
- [ ] Safe multi-sig integration
- [ ] ERC-4337 account abstraction
- [ ] Cross-chain swaps
- [ ] Advanced strategies (arbitrage, MEV)
- [ ] Mobile app (React Native)

### Phase 3 (Q3 2024)
- [ ] AI model fine-tuning
- [ ] Multi-user collaboration
- [ ] DAO treasury management
- [ ] Analytics dashboard
- [ ] API for third-party integrations

### Phase 4 (Q4 2024)
- [ ] L2 expansion (zkSync, Starknet)
- [ ] NFT management
- [ ] Social features
- [ ] Governance token
- [ ] Decentralized agent network

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** - AI/LLM capabilities
- **LangChain** - Agent framework
- **Next.js** - Frontend framework
- **Viem** - Ethereum library
- **Safe** - Multi-sig wallet infrastructure
- **DeFiLlama** - DeFi data aggregation
- **Tenderly** - Transaction simulation

## 📞 Support

- **Documentation**: [docs.sentientwallet.io](https://docs.sentientwallet.io)
- **Discord**: [discord.gg/sentientwallet](https://discord.gg/sentientwallet)
- **Twitter**: [@SentientWallet](https://twitter.com/SentientWallet)
- **Email**: support@sentientwallet.io

## ⚠️ Disclaimer

**IMPORTANT**: This software is in active development and should be used with caution:

- ⚠️ Test thoroughly on testnet before using mainnet
- ⚠️ Never invest more than you can afford to lose
- ⚠️ DeFi carries inherent risks including smart contract bugs, impermanent loss, and market volatility
- ⚠️ AI agents can make mistakes - always review transactions
- ⚠️ Use small amounts initially to test the system
- ⚠️ This is not financial advice - DYOR (Do Your Own Research)

---

**Built with ❤️ by the SentientWallet Team**

*Making DeFi accessible through AI-powered automation*#   S e n t i e n t W a l l e t  
 