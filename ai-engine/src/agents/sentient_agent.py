"""
SentientWallet AI Agent - Sentient-Alpha
High-Frequency Treasury Management Agent with Chain-of-Thought Reasoning
"""

import asyncio
import json
import time
from typing import Any, Dict, List, Optional

import google.generativeai as genai
from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from langchain.tools import Tool
from langchain_google_genai import ChatGoogleGenerativeAI

from ..tools.defi_tools import (
    get_market_sentiment,
    get_pool_apy,
    get_wallet_balance,
    get_yields,
)
from ..utils.config import settings
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


# ==================== System Prompt ====================

SYSTEM_PROMPT = """### ROLE:

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
  "action_type": "SWAP" | "STAKE" | "UNSTAKE" | "WAIT" | "HARVEST" | "REBALANCE",
  "data": { "token_in": "...", "token_out": "...", "amount": "...", "protocol": "..." },
  "confidence_score": 0.0-1.0,
  "requires_approval": boolean
}

### CHAIN-OF-THOUGHT REASONING:

Always show your reasoning process:
1. What data did you analyze?
2. What patterns or opportunities did you identify?
3. What are the risks involved?
4. Why is this the optimal action?
5. What is your confidence level?

### SAFETY RULES:

- ALWAYS verify whitelist before suggesting protocols
- ALWAYS check gas prices before non-emergency actions
- ALWAYS calculate confidence scores honestly
- NEVER take actions that could result in >2% portfolio drawdown
- ALWAYS request approval if confidence < 80%

Remember: You are managing real assets. Precision and caution are paramount."""


# ==================== Agent Class ====================


class SentientAgent:
    """
    Main AI Agent class that handles perception, reasoning, and action generation
    """

    def __init__(self):
        self.is_active = False
        self.model: Optional[ChatGoogleGenerativeAI] = None
        self.agent_executor: Optional[AgentExecutor] = None
        self.whitelist = ["aave", "uniswap", "curve", "lido"]
        self.max_gas_price = 60  # Gwei
        self.max_single_swap_pct = 0.15  # 15%
        self.approval_threshold = 0.80  # 80% confidence
        self.active_users: Dict[str, bool] = {}

        logger.info("SentientAgent initialized")

    async def initialize(self):
        """Initialize the AI agent with Gemini"""
        try:
            # Configure Gemini
            genai.configure(api_key=settings.GEMINI_API_KEY)

            # Initialize LangChain model
            self.model = ChatGoogleGenerativeAI(
                model=settings.GEMINI_MODEL,
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.7,
                top_p=0.95,
                top_k=40,
                max_output_tokens=2048,
            )

            # Create tools
            tools = self._create_tools()

            # Create agent with ReAct pattern
            prompt = PromptTemplate.from_template(
                SYSTEM_PROMPT
                + """

Current Context:
{input}

Available Tools:
{tools}

Tool Names: {tool_names}

Agent Scratchpad:
{agent_scratchpad}

Think step by step and provide your analysis."""
            )

            # Note: For production, you'd use a proper agent framework
            # This is a simplified version
            self.is_active = True
            logger.info("AI Agent initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize agent: {e}", exc_info=True)
            raise

    def _create_tools(self) -> List[Tool]:
        """Create LangChain tools for the agent"""
        return [
            Tool(
                name="get_wallet_balance",
                func=lambda address: asyncio.run(get_wallet_balance(address)),
                description="Get the current balance of a wallet address. Input: wallet_address (string). Returns: Dict with token balances and total value in USD.",
            ),
            Tool(
                name="get_yields",
                func=lambda x: asyncio.run(get_yields()),
                description="Get current yield opportunities from DeFi protocols. Returns: List of yield pools with APY, TVL, and risk scores.",
            ),
            Tool(
                name="get_pool_apy",
                func=lambda pool_id: asyncio.run(get_pool_apy(pool_id)),
                description="Get the current APY for a specific pool. Input: pool_id (string). Returns: Float APY value.",
            ),
            Tool(
                name="get_market_sentiment",
                func=lambda x: asyncio.run(get_market_sentiment()),
                description="Get current market sentiment including gas prices, fear/greed index, and protocol alerts. Returns: Dict with sentiment data.",
            ),
        ]

    async def run_perception_cycle(self):
        """Run a full perception cycle for all active users"""
        logger.info("Starting perception cycle for all active users")

        try:
            # In production, fetch active users from database
            active_user_ids = list(self.active_users.keys())

            for user_id in active_user_ids:
                if self.active_users.get(user_id, False):
                    try:
                        await self.run_perception_for_user(user_id, None)
                    except Exception as e:
                        logger.error(
                            f"Error in perception for user {user_id}: {e}",
                            exc_info=True,
                        )

            logger.info(f"Perception cycle completed for {len(active_user_ids)} users")

        except Exception as e:
            logger.error(f"Perception cycle error: {e}", exc_info=True)

    async def run_perception_for_user(
        self,
        user_id: str,
        wallet_address: Optional[str],
        safe_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Run perception loop for a specific user
        """
        logger.info(f"Running perception for user: {user_id}")

        try:
            # Step 1: Data Gathering (PERCEPTION)
            logger.info("Step 1: Gathering market data...")

            # Get wallet balance
            balance_data = await get_wallet_balance(wallet_address or safe_address)

            # Get yield opportunities
            yields_data = await get_yields()

            # Get market sentiment
            sentiment_data = await get_market_sentiment()

            # Step 2: Construct context
            context = {
                "user_id": user_id,
                "wallet_balance": balance_data,
                "yields": yields_data[:5],  # Top 5 opportunities
                "sentiment": sentiment_data,
                "timestamp": int(time.time()),
            }

            # Step 3: AI Analysis (COGNITIVE STEP)
            logger.info("Step 2: Running AI analysis...")
            result = await self._analyze_and_generate_action(context)

            # Step 4: Validation
            logger.info("Step 3: Validating action...")
            validated_result = await self._validate_action(result, context)

            logger.info(
                f"Perception completed. Action: {validated_result.get('action_type')}, Confidence: {validated_result.get('confidence_score')}"
            )

            return validated_result

        except Exception as e:
            logger.error(f"Perception error for user {user_id}: {e}", exc_info=True)
            return {
                "thought_process": f"Error during perception: {str(e)}",
                "action_type": "WAIT",
                "data": {},
                "confidence_score": 0.0,
                "requires_approval": True,
                "timestamp": int(time.time() * 1000),
            }

    async def _analyze_and_generate_action(
        self, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Use Gemini to analyze data and generate action
        """
        try:
            # Prepare prompt
            prompt = f"""You are Sentient-Alpha, analyzing a DeFi portfolio.

Current Context:
- Wallet Balance: {json.dumps(context.get("wallet_balance", {}), indent=2)}
- Top Yield Opportunities: {json.dumps(context.get("yields", []), indent=2)}
- Market Sentiment: {json.dumps(context.get("sentiment", {}), indent=2)}

Your Task:
Analyze this data and suggest the optimal action to maximize yield while preserving capital.
Follow the Chain-of-Thought reasoning framework.

Remember:
- Only use whitelisted protocols: Aave, Uniswap V3, Curve, Lido
- Maximum 15% of portfolio per transaction
- Check gas prices
- Confidence threshold: 80% for autonomous execution

Respond ONLY with valid JSON in the specified format."""

            # Call Gemini
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(prompt)

            # Parse response
            response_text = response.text.strip()

            # Extract JSON from response
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()

            result = json.loads(response_text)

            # Add timestamp
            result["timestamp"] = int(time.time() * 1000)

            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            return self._create_wait_action(
                "AI response was not valid JSON. Waiting for next cycle."
            )
        except Exception as e:
            logger.error(f"AI analysis error: {e}", exc_info=True)
            return self._create_wait_action(f"Analysis error: {str(e)}")

    async def _validate_action(
        self, action: Dict[str, Any], context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Validate the AI-generated action against constraints
        """
        try:
            action_type = action.get("action_type", "WAIT")
            data = action.get("data", {})
            confidence_score = action.get("confidence_score", 0.0)

            # Check whitelist
            protocol = data.get("protocol", "").lower()
            if protocol and protocol not in self.whitelist:
                logger.warning(
                    f"Protocol {protocol} not in whitelist. Aborting action."
                )
                action["action_type"] = "WAIT"
                action["requires_approval"] = True
                action["thought_process"] += " [REJECTED: Protocol not whitelisted]"
                return action

            # Check gas price
            gas_price = context.get("sentiment", {}).get("gas_price_gwei", 0)
            if gas_price > self.max_gas_price and action_type != "WAIT":
                logger.warning(
                    f"Gas price {gas_price} exceeds max {self.max_gas_price}. Aborting."
                )
                action["action_type"] = "WAIT"
                action["requires_approval"] = True
                action["thought_process"] += (
                    f" [REJECTED: Gas price too high: {gas_price} Gwei]"
                )
                return action

            # Check confidence threshold
            if confidence_score < self.approval_threshold:
                logger.info(
                    f"Confidence {confidence_score} below threshold. Requiring approval."
                )
                action["requires_approval"] = True

            return action

        except Exception as e:
            logger.error(f"Validation error: {e}", exc_info=True)
            return self._create_wait_action(f"Validation error: {str(e)}")

    def _create_wait_action(self, reason: str) -> Dict[str, Any]:
        """Create a WAIT action with a reason"""
        return {
            "thought_process": reason,
            "action_type": "WAIT",
            "data": {},
            "confidence_score": 0.0,
            "requires_approval": True,
            "timestamp": int(time.time() * 1000),
        }

    async def process_command(
        self, user_id: str, command: str, command_type: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process a user command (text or voice)
        """
        logger.info(f"Processing {command_type} command for user {user_id}: {command}")

        try:
            prompt = f"""User Command: "{command}"

Analyze this command and determine what action the user wants to take with their DeFi portfolio.

Context: {json.dumps(context, indent=2)}

Respond with a JSON action following the standard format."""

            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(SYSTEM_PROMPT + "\n\n" + prompt)

            response_text = response.text.strip()

            # Extract JSON
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()

            action = json.loads(response_text)
            action["timestamp"] = int(time.time() * 1000)

            return {
                "success": True,
                "action": action,
                "message": "Command processed successfully",
                "timestamp": int(time.time() * 1000),
            }

        except Exception as e:
            logger.error(f"Command processing error: {e}", exc_info=True)
            return {
                "success": False,
                "action": self._create_wait_action(f"Command error: {str(e)}"),
                "message": f"Failed to process command: {str(e)}",
                "timestamp": int(time.time() * 1000),
            }

    async def execute_action(self, action_id: str, user_id: str):
        """Execute an approved action"""
        logger.info(f"Executing action {action_id} for user {user_id}")
        # TODO: Implement actual blockchain execution
        await asyncio.sleep(1)  # Simulate execution
        logger.info(f"Action {action_id} executed successfully")

    async def reject_action(self, action_id: str, user_id: str):
        """Reject a pending action"""
        logger.info(f"Action {action_id} rejected by user {user_id}")
        # TODO: Update database

    async def stop_for_user(self, user_id: str):
        """Stop agent for a specific user"""
        logger.warning(f"Stopping agent for user {user_id}")
        self.active_users[user_id] = False

    async def shutdown(self):
        """Shutdown the agent"""
        logger.info("Shutting down AI Agent")
        self.is_active = False
        self.active_users.clear()
