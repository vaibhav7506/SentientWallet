"""
SentientWallet AI Engine - Main FastAPI Application
Autonomous AI agent for DeFi treasury management
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional

import uvicorn
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from src.agents.sentient_agent import SentientAgent
from src.tools.defi_tools import get_market_sentiment, get_wallet_balance, get_yields
from src.utils.config import settings
from src.utils.logger import setup_logger

# Setup logger
logger = setup_logger(__name__)

# Global agent instance
agent: Optional[SentientAgent] = None
perception_task: Optional[asyncio.Task] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global agent, perception_task

    logger.info("Starting SentientWallet AI Engine...")

    # Initialize the AI agent
    try:
        agent = SentientAgent()
        await agent.initialize()
        logger.info("AI Agent initialized successfully")

        # Start perception loop
        perception_task = asyncio.create_task(run_perception_loop())
        logger.info("Perception loop started")

    except Exception as e:
        logger.error(f"Failed to initialize AI agent: {e}")
        raise

    yield

    # Cleanup
    logger.info("Shutting down AI Engine...")
    if perception_task:
        perception_task.cancel()
        try:
            await perception_task
        except asyncio.CancelledError:
            pass

    if agent:
        await agent.shutdown()

    logger.info("AI Engine shutdown complete")


# Initialize FastAPI app
app = FastAPI(
    title="SentientWallet AI Engine",
    description="Autonomous AI agent for DeFi treasury management using Gemini AI",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Pydantic Models ====================


class HealthResponse(BaseModel):
    status: str
    version: str
    agent_active: bool
    timestamp: int


class PerceptionRequest(BaseModel):
    user_id: str
    wallet_address: str
    safe_address: Optional[str] = None


class PerceptionResponse(BaseModel):
    success: bool
    thought_process: str
    action_type: str
    data: dict
    confidence_score: float
    requires_approval: bool
    timestamp: int


class CommandRequest(BaseModel):
    user_id: str
    command: str
    command_type: str = Field(default="text", description="text or voice")
    context: Optional[dict] = None


class CommandResponse(BaseModel):
    success: bool
    action: dict
    message: str
    timestamp: int


class ActionApprovalRequest(BaseModel):
    action_id: str
    user_id: str
    approved: bool


class ActionApprovalResponse(BaseModel):
    success: bool
    message: str
    execution_result: Optional[dict] = None


# ==================== Helper Functions ====================


async def run_perception_loop():
    """Background task that runs the perception loop"""
    global agent

    logger.info("Perception loop started")

    while True:
        try:
            await asyncio.sleep(settings.PERCEPTION_INTERVAL_SECONDS)

            if agent:
                logger.info("Running perception cycle...")
                await agent.run_perception_cycle()
                logger.info("Perception cycle completed")

        except asyncio.CancelledError:
            logger.info("Perception loop cancelled")
            break
        except Exception as e:
            logger.error(f"Error in perception loop: {e}", exc_info=True)
            # Continue running despite errors
            await asyncio.sleep(60)  # Wait a minute before retrying


def get_agent() -> SentientAgent:
    """Dependency to get the global agent instance"""
    if agent is None:
        raise HTTPException(status_code=503, detail="AI Agent not initialized")
    return agent


# ==================== API Endpoints ====================


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SentientWallet AI Engine",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    import time

    return HealthResponse(
        status="healthy",
        version="1.0.0",
        agent_active=agent is not None and agent.is_active,
        timestamp=int(time.time() * 1000),
    )


@app.post("/api/perception", response_model=PerceptionResponse)
async def trigger_perception(
    request: PerceptionRequest, current_agent: SentientAgent = Depends(get_agent)
):
    """
    Manually trigger a perception cycle for a specific user
    """
    try:
        logger.info(f"Manual perception triggered for user: {request.user_id}")

        result = await current_agent.run_perception_for_user(
            user_id=request.user_id,
            wallet_address=request.wallet_address,
            safe_address=request.safe_address,
        )

        return PerceptionResponse(
            success=True,
            thought_process=result.get("thought_process", ""),
            action_type=result.get("action_type", "WAIT"),
            data=result.get("data", {}),
            confidence_score=result.get("confidence_score", 0.0),
            requires_approval=result.get("requires_approval", True),
            timestamp=result.get("timestamp", 0),
        )

    except Exception as e:
        logger.error(f"Perception error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Perception failed: {str(e)}")


@app.post("/api/command", response_model=CommandResponse)
async def process_command(
    request: CommandRequest, current_agent: SentientAgent = Depends(get_agent)
):
    """
    Process a user command (text or voice)
    """
    try:
        logger.info(
            f"Processing command from user {request.user_id}: {request.command}"
        )

        result = await current_agent.process_command(
            user_id=request.user_id,
            command=request.command,
            command_type=request.command_type,
            context=request.context or {},
        )

        return CommandResponse(
            success=True,
            action=result.get("action", {}),
            message=result.get("message", "Command processed successfully"),
            timestamp=result.get("timestamp", 0),
        )

    except Exception as e:
        logger.error(f"Command processing error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Command processing failed: {str(e)}"
        )


@app.post("/api/approve-action", response_model=ActionApprovalResponse)
async def approve_action(
    request: ActionApprovalRequest,
    background_tasks: BackgroundTasks,
    current_agent: SentientAgent = Depends(get_agent),
):
    """
    Approve or reject a pending action
    """
    try:
        logger.info(
            f"Action {request.action_id} {'approved' if request.approved else 'rejected'} by user {request.user_id}"
        )

        if request.approved:
            # Execute action in background
            background_tasks.add_task(
                current_agent.execute_action, request.action_id, request.user_id
            )

            return ActionApprovalResponse(
                success=True,
                message="Action approved and queued for execution",
                execution_result=None,
            )
        else:
            # Reject action
            await current_agent.reject_action(request.action_id, request.user_id)

            return ActionApprovalResponse(
                success=True, message="Action rejected", execution_result=None
            )

    except Exception as e:
        logger.error(f"Action approval error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Action approval failed: {str(e)}")


@app.post("/api/stop-agent")
async def stop_agent(user_id: str, current_agent: SentientAgent = Depends(get_agent)):
    """
    Stop the AI agent for a specific user (emergency stop)
    """
    try:
        logger.warning(f"STOP command received for user: {user_id}")

        await current_agent.stop_for_user(user_id)

        return {
            "success": True,
            "message": f"AI agent stopped for user {user_id}",
            "timestamp": int(asyncio.get_event_loop().time() * 1000),
        }

    except Exception as e:
        logger.error(f"Stop agent error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to stop agent: {str(e)}")


@app.get("/api/market-data/yields")
async def get_yield_opportunities(
    chain_id: Optional[int] = None, min_apy: Optional[float] = None
):
    """
    Get current yield opportunities from DeFi protocols
    """
    try:
        yields = await get_yields(chain_id=chain_id, min_apy=min_apy)
        return {"success": True, "data": yields, "count": len(yields)}
    except Exception as e:
        logger.error(f"Error fetching yields: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch yields: {str(e)}")


@app.get("/api/market-data/sentiment")
async def get_sentiment():
    """
    Get current market sentiment
    """
    try:
        sentiment = await get_market_sentiment()
        return {"success": True, "data": sentiment}
    except Exception as e:
        logger.error(f"Error fetching sentiment: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch sentiment: {str(e)}"
        )


@app.get("/api/wallet/{address}/balance")
async def get_balance(address: str, chain_id: Optional[int] = 1):
    """
    Get wallet balance
    """
    try:
        balance = await get_wallet_balance(address, chain_id)
        return {"success": True, "data": balance}
    except Exception as e:
        logger.error(f"Error fetching balance: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch balance: {str(e)}"
        )


# ==================== Error Handlers ====================


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail, "status_code": exc.status_code},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else None,
        },
    )


# ==================== Main Entry Point ====================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True,
    )
