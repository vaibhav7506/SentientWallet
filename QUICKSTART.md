# SentientWallet Quick Start Guide 🚀

Get up and running with SentientWallet in under 10 minutes!

## Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 18.17+** - [Download](https://nodejs.org/)
- ✅ **Python 3.10+** - [Download](https://www.python.org/)
- ✅ **PostgreSQL 14+** - [Download](https://www.postgresql.org/) or use Docker
- ✅ **Git** - [Download](https://git-scm.com/)

## Step-by-Step Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/SentientWallet.git
cd SentientWallet
```

### 2️⃣ Run Automated Setup (Recommended)

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows (Git Bash):**
```bash
bash setup.sh
```

The script will guide you through the setup process automatically!

### 3️⃣ Or Manual Setup

If you prefer to set up manually:

#### Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your settings
```

#### Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npx prisma generate
npx prisma migrate dev
```

#### Setup AI Engine
```bash
cd ai-engine
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Gemini API key
```

### 4️⃣ Get Your API Keys

You'll need these API keys to run SentientWallet:

#### **Required:**

1. **Gemini API Key** (for AI agent)
   - Visit: https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy and paste into `ai-engine/.env`:
     ```
     GEMINI_API_KEY=your_key_here
     ```

2. **Alchemy API Key** (for blockchain access)
   - Visit: https://dashboard.alchemy.com/
   - Sign up and create a new app
   - Copy the API key to `backend/.env`:
     ```
     ALCHEMY_API_KEY=your_key_here
     ```

#### **Optional (but recommended):**

3. **Tenderly API Key** (for transaction simulation)
   - Visit: https://dashboard.tenderly.co/
   - Create account and get your API key
   - Add to `backend/.env`

### 5️⃣ Setup Database

#### Option A: Using Docker (Easiest)
```bash
docker-compose up -d postgres redis
```

#### Option B: Local PostgreSQL
```bash
# Create database
createdb sentientwallet

# Update backend/.env with your connection string
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/sentientwallet

# Run migrations
cd backend
npx prisma migrate dev
```

### 6️⃣ Start the Services

#### Option A: Using Docker (Recommended)
```bash
docker-compose up
```

All services will start automatically!

#### Option B: Manual Start

Open 3 terminals and run:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - AI Engine:**
```bash
cd ai-engine
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 7️⃣ Open Your Browser

Visit these URLs:

- 🎨 **Frontend Dashboard**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:3001
- 🤖 **AI Engine**: http://localhost:8000
- 📚 **API Documentation**: http://localhost:8000/docs

## First Time Using SentientWallet

### Connect Your Wallet

1. Click **"Connect Wallet"** button in the top right
2. Select your wallet (MetaMask, WalletConnect, etc.)
3. Approve the connection

### Configure Safety Settings

Before using autonomous mode, configure your guardrails:

1. **Operating Mode**: Start with "Manual Approval" (toggle at left sidebar)
2. **Daily Spend Limit**: Set to a small amount for testing (e.g., $100)
3. **Max Gas Price**: Set to 60 Gwei or your preference
4. **Protocol Whitelist**: Enable only protocols you trust (Aave, Uniswap, Curve, Lido)

### Try Your First Command

Use the command bar at the bottom:

**Text Commands:**
- Type: `"What are my current holdings?"`
- Type: `"Find me the best yield opportunities"`
- Type: `"Suggest a portfolio rebalance"`

**Voice Commands:**
- Click the microphone icon 🎤
- Say: "Analyze my portfolio"
- Say: "What's the best APY available?"

### Monitor AI Activity

Watch the **Intelligence Feed** in the center:
- See AI reasoning in real-time
- Review confidence scores
- Approve or reject suggestions

### Emergency Stop

If anything goes wrong, click the **Kill Switch** 🔴 (top right):
- Instantly stops all AI operations
- Revokes all permissions
- Cancels pending transactions

## Testing on Testnet (Recommended First)

Before using mainnet, test on Goerli or Sepolia:

1. Update `frontend/.env.local`:
   ```
   NEXT_PUBLIC_CHAIN_ID=5  # Goerli
   ```

2. Get testnet ETH from faucets:
   - Goerli: https://goerlifaucet.com/
   - Sepolia: https://sepoliafaucet.com/

3. Test all features with fake money first!

## Common Issues & Solutions

### "Cannot connect to database"
- Make sure PostgreSQL is running
- Check `DATABASE_URL` in `backend/.env`
- Try: `docker-compose up -d postgres`

### "Gemini API error"
- Verify your API key is correct
- Check you have credits/quota remaining
- Visit: https://makersuite.google.com/

### "Module not found" errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- For Python: `pip install -r requirements.txt --force-reinstall`

### "Port already in use"
- Change ports in environment files
- Or stop conflicting services

### Voice commands not working
- Make sure you're using HTTPS or localhost
- Check browser permissions for microphone
- Try Chrome or Edge (best compatibility)

## Development Tools

### View Database (Prisma Studio)
```bash
cd backend
npm run prisma:studio
```
Opens at http://localhost:5555

### View Logs
```bash
# Backend logs
tail -f backend/logs/combined.log

# AI Engine logs
tail -f ai-engine/logs/app.log

# Or view in terminal where services are running
```

### Run Tests
```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && npm test

# AI Engine
cd ai-engine && pytest
```

## Next Steps

Once everything is working:

1. ✅ Read the full [README.md](README.md)
2. ✅ Review [Read.md](Read.md) for architecture details
3. ✅ Check the API documentation at http://localhost:8000/docs
4. ✅ Join our Discord for support (link in README)
5. ✅ Test with small amounts first
6. ✅ Gradually increase limits as you gain confidence

## Architecture Quick Reference

```
Frontend (Port 3000)
    ↓ WebSocket/HTTP
Backend (Port 3001)
    ↓ HTTP
AI Engine (Port 8000)
    ↓
Gemini AI + DeFi APIs
```

## Environment Variables Cheat Sheet

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_CHAIN_ID=1
```

### Backend (.env)
```env
DATABASE_URL=postgresql://localhost:5432/sentientwallet
ALCHEMY_API_KEY=your_alchemy_key
GEMINI_API_KEY=your_gemini_key
TENDERLY_API_KEY=your_tenderly_key
JWT_SECRET=change_in_production
```

### AI Engine (.env)
```env
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-pro
HOST=0.0.0.0
PORT=8000
```

## Pro Tips

💡 **Start Small**: Begin with manual approval mode and low limits

💡 **Test Everything**: Use testnet before mainnet

💡 **Monitor Closely**: Watch the Intelligence Feed and Terminal

💡 **Use Voice**: Voice commands are more natural than typing

💡 **Emergency Ready**: Know where the Kill Switch is

💡 **Keep Updated**: Pull latest changes regularly

💡 **Read Logs**: Terminal shows detailed AI reasoning

💡 **Whitelist Carefully**: Only enable trusted protocols

## Getting Help

If you're stuck:

1. Check the [README.md](README.md) for detailed docs
2. Look at the logs for error messages
3. Search existing GitHub issues
4. Join our Discord community
5. Open a GitHub issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

## Security Reminders

⚠️ **Never commit `.env` files**

⚠️ **Use testnet first**

⚠️ **Start with small amounts**

⚠️ **Review all transactions**

⚠️ **Keep API keys secret**

⚠️ **Use hardware wallet for large amounts**

⚠️ **Enable 2FA on all accounts**

---

## You're Ready! 🎉

Your SentientWallet setup is complete. Time to experience AI-powered DeFi management!

**Remember**: This is cutting-edge technology. Start cautiously, test thoroughly, and gradually increase your usage as you become comfortable.

Happy Trading! 🚀💰

---

**Built with ❤️ by the SentientWallet Team**

Need help? Check out our [Discord](https://discord.gg/sentientwallet) or [GitHub Discussions](https://github.com/yourusername/SentientWallet/discussions)