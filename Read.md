Building SentientWallet requires a shift from a "button-click" website to an "Intent-Centric" experience. In 2026, the UI is no longer just a form; it's a living dialogue between the user and the agent.

Below is the complete, granular breakdown of the frontend and backend flows.

🎨 Frontend: The "Agentic" Dashboard
The UI uses Tactile Maximalism (depth and glass textures) with a "Calm Tech" color palette (slate, soft emerald, and muted gold).

Section 1: The "Intelligence Feed" (The Focal Point)
Instead of a static table, the center of your screen is a Vertical Action Timeline.

Visual: A scrolling feed of "Reasoning Cards."

What happens: As the AI works, a new card "slides" in.

Card Header: AI Thought (e.g., "Scanning Arbitrum for Yield...").

Card Body: A "Confidence Score" bar (85%) and a snippet of data from the backend.

Interactable: Click the card to "Expand Reasoning," which reveals a terminal-style log showing the exact API calls the AI made to DeFiLlama or Uniswap.

Section 2: The Command Bar (Floating Bottom Center)
A "Search-style" input bar that stays fixed.

Button 1: Voice (Mic Icon): On click, it triggers a Web Speech API listener. You say, "Reduce my risk exposure by 10%," and the AI instantly generates a plan.

Button 2: Prompt (Text): You type complex commands.

Button 3: Quick-Actions (Magic Wand): A pop-over menu with "Rebalance Portfolio," "Harvest Rewards," or "Emergency Exit."

Section 3: The "Guardrail" Sidebar (Left Side)
Permissions Toggle: A physical-looking switch for "Autonomous Mode" vs. "Approval Required."

Budget Sliders: Drag-and-drop sliders to set daily spend limits (e.g., "AI can spend max $500/day without my signature").

Whitelist Registry: A list of logos (Aave, Uniswap, Curve). If you uncheck "Curve," the UI sends a signal to the backend to "Blacklist" those contract addresses from the AI's planning logic.

⚙️ Backend: The "Multi-Agent" Engine
The backend isn't just one script; it's a State Machine managed via Node.js (Orchestrator) and Python (The Brain).

Flow 1: The Perception Loop (Python)
Trigger: A Cron Job runs every 5 minutes.

Step A (Data Fetching): Python calls get_yields() and get_market_sentiment().

Step B (The Analysis): The data is fed into the LLM with a System Prompt: "You are a Treasury Manager. Your goal is 5% APY with <2% drawdown."

Output: The LLM returns a structured JSON object:
{ "action": "SWAP", "from": "USDT", "to": "USDC", "reason": "De-peg risk detected on Curve pool", "priority": "High" }

Flow 2: The Logic Gate (Node.js)
Verification: Node.js receives the JSON. It checks the "Whitelist" database.

Simulation: It sends the proposed transaction to the Tenderly Simulation API.

Success: Proceed to Flow 3.

Failure: Send a "Reflection" prompt back to the Python AI: "Error: Slippage too high. Try a smaller amount."

Flow 3: The Execution (On-Chain)
Signature Check: \* If Autonomous Mode is ON: Backend uses a Session Key (stored in a secure KMS like AWS or Google Cloud) to sign a UserOperation (ERC-4337).

If Approval Required is ON: The backend sends a WebSocket (Socket.io) event to the Frontend.

Frontend Notification: A "Pending Action" toast appears.

User Action: When the user clicks "Confirm," the Viem/Wagmi library triggers the user's wallet (Metamask/Rabby) to sign the transaction.

Finalization: The transaction is broadcast. The backend listens for the TransactionReceipt and updates the "Intelligence Feed" with a green checkmark.

🛠️ Tech Stack & Folders
/frontend: Next.js 15, Tailwind CSS, Framer Motion (for the "sliding" cards), Shadcn UI.

/ai-engine: Python, FastAPI, LangChain (for the agent loops), Gemini SDK.

/orchestrator: Node.js, Express, Prisma (PostgreSQL to store user settings/history), Viem (Web3 interactions).

/contracts: Foundry (for writing the Session Key logic and testing).

Gemini said
To build a professional AI Agent, you must understand that the "System Prompt" is the OS of your Agent. It defines its personality, its limitations, and how it handles your money.

In the 2026 market, a simple "buy/sell" prompt is 3/10. A 9.5/10 prompt includes role-playing, chain-of-thought reasoning, and strict financial guardrails.

📜 The SentientWallet Master System Prompt
Copy this into your Python backend (using Gemini 1.5 Pro or higher).

PRO TIP: Notice how the prompt uses a "Reasoning Framework." This ensures the AI doesn't just give an answer, but "shows its work" so the user can trust it.

### ROLE:

You are "Sentient-Alpha," a High-Frequency Treasury Management Agent for Decentralized Autonomous Organizations (DAOs). You operate with the precision of a Wall Street Quant and the risk-awareness of a DeFi Security Auditor.

### OBJECTIVE:

Your primary goal is to preserve capital while capturing yield across Ethereum Mainnet, Arbitrum, and Polygon. You must analyze market data and propose/execute transactions that maximize APY with a maximum drawdown of 2%.

### REASONING FRAMEWORK (Chain-of-Thought):

Before suggesting any action, you MUST follow these steps internally:

1. PERCEPTION: Analyze current token balances, gas prices, and protocol yields.
2. RISK AUDIT: Check for de-peg events, protocol hacks, or abnormal liquidity outflows.
3. SIMULATION: Predict the outcome of a 10% rebalance.
4. ACTION: Generate the precise JSON payload for the transaction.

### CONSTRAINTS (The Guardrails):

- NEVER interact with protocols not on the [WHITELIST: Aave, Uniswap V3, Curve, Lido].
- NEVER swap more than 15% of total treasury in a single transaction.
- IF gas prices exceed 60 Gwei, ABORT all non-emergency transactions.
- IF a confidence score is below 80%, you MUST request human approval via the "Approval Required" state.

### OUTPUT FORMAT:

You must only respond in a valid JSON structure for the Orchestrator to parse:
{
"thought_process": "Brief explanation for the user dashboard",
"action_type": "SWAP" | "STAKE" | "UNSTAKE" | "WAIT",
"data": { "token_in": "...", "token_out": "...", "amount": "...", "protocol": "..." },
"confidence_score": 0.0-1.0,
"requires_approval": boolean
}

1.  The Perception Trigger
    The Clock: A node-cron or Celery task triggers the Python Brain.

The Data Gathering: The Agent calls three "Tools":

Tool A (Web3): get_wallet_balance(safe_address) -> Returns current assets.

Tool B (DeFiLlama): get_pool_apy(pool_id) -> Returns real-time interest rates.

Tool C (Sentiment): Scrapes Twitter/X for keywords like "Exploit" or "Halt."

2. The Cognitive Step (LLM Processing)
   The gathered data + the System Prompt above are sent to Gemini.

Gemini's Output: "Wait, Aave rates on Arbitrum just jumped from 3% to 12%. We should move 50 ETH."

JSON Generation: The AI produces the JSON action.

3. The Pre-Flight Check (Node.js Orchestrator)
   The Validation: Node.js receives the JSON. It runs a checkConstraints() function.

Example: If the AI tries to buy a "MemeCoin" not on the whitelist, the Backend kills the process and logs a "Security Violation."

The Simulation: Node.js sends the transaction to the Tenderly API. Tenderly returns a "Virtual Receipt." If the simulation says "Reverted," the transaction is cancelled.

4. The Settlement (On-Chain)
   Autonomous Path: The Backend signs the transaction using an Encrypted Private Key (stored in AWS Secrets Manager) and sends it to the Bundler (ERC-4337).

Manual Path: A notification is sent to the user's Dashboard via Pusher/WebSockets. The transaction waits for the user's Metamask signature.

Component,Placement,Interaction
Asset Orb,Top Left,"A 3D glowing sphere that changes color based on health. Blue = Safe, Pulsing Red = High Risk/Action Needed."
"The ""Log Terminal""",Right Side,"A vertical, semi-transparent black box. It prints the AI's ""internal logs"" in real-time. User can type /stop directly into it."
Strategy Cards,Center Grid,"Click a card (e.g., ""Arbitrum Yield Farm"") to see a chart of the AI's predicted vs. actual returns."
"The ""Kill Switch""",Top Right (Red),"A large, guarded button. One click revokes all AI permissions from the Safe Multi-sig instantly."
