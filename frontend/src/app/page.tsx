'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AssetOrb, defaultOrbHealth } from '@/components/dashboard/AssetOrb';
import { IntelligenceFeed } from '@/components/dashboard/IntelligenceFeed';
import { CommandBar } from '@/components/dashboard/CommandBar';
import { GuardrailSidebar } from '@/components/dashboard/GuardrailSidebar';
import { LogTerminal } from '@/components/dashboard/LogTerminal';
import { KillSwitch } from '@/components/dashboard/KillSwitch';
import {
  ReasoningCard,
  AgentLog,
  UserSettings,
  OrbHealth,
  ProtocolWhitelist,
} from '@/types';
import { generateId } from '@/lib/utils';

export default function DashboardPage() {
  // State Management
  const [reasoningCards, setReasoningCards] = useState<ReasoningCard[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [orbHealth, setOrbHealth] = useState<OrbHealth>(defaultOrbHealth);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    user_id: '1',
    wallet_address: '0x0000000000000000000000000000000000000000',
    autonomous_mode: false,
    daily_spend_limit: 1000,
    max_gas_price: 60,
    whitelist: [
      {
        protocol: 'aave',
        name: 'Aave',
        logo: 'https://icons.llamao.fi/icons/protocols/aave',
        enabled: true,
        contract_addresses: ['0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'],
        chains: [1, 137, 42161],
      },
      {
        protocol: 'uniswap',
        name: 'Uniswap V3',
        logo: 'https://icons.llamao.fi/icons/protocols/uniswap',
        enabled: true,
        contract_addresses: ['0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'],
        chains: [1, 10, 137, 42161],
      },
      {
        protocol: 'curve',
        name: 'Curve',
        logo: 'https://icons.llamao.fi/icons/protocols/curve',
        enabled: true,
        contract_addresses: ['0xd51a44d3fae010294c616388b506acda1bfaae46'],
        chains: [1, 10, 137, 42161],
      },
      {
        protocol: 'lido',
        name: 'Lido',
        logo: 'https://icons.llamao.fi/icons/protocols/lido',
        enabled: false,
        contract_addresses: ['0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'],
        chains: [1],
      },
    ],
    blacklist: [],
    notification_preferences: {
      email: true,
      push: true,
      websocket: true,
      threshold_amount: 100,
    },
    risk_tolerance: 'moderate',
    target_apy: 5,
    max_drawdown: 2,
  });

  // WebSocket connection (placeholder)
  useEffect(() => {
    // TODO: Connect to WebSocket server
    const connectWebSocket = () => {
      const ws = new WebSocket(
        process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
      );

      ws.onopen = () => {
        addLog('info', 'Connected to SentientWallet backend');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        addLog('error', 'WebSocket connection error');
      };

      ws.onclose = () => {
        addLog('warning', 'Disconnected from backend. Reconnecting...');
        setTimeout(connectWebSocket, 5000);
      };

      return ws;
    };

    // Uncomment to enable WebSocket
    // const ws = connectWebSocket();
    // return () => ws.close();

    // Mock data for demo
    addLog('info', 'SentientWallet initialized');
    addLog('info', 'Autonomous mode: ' + (settings.autonomous_mode ? 'ON' : 'OFF'));
    addLog('success', 'Monitoring 3 protocols across 4 chains');
  }, []);

  // Handlers
  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'agent_action':
        handleAgentAction(message.payload);
        break;
      case 'log_update':
        addLog(message.payload.level, message.payload.message, message.payload.data);
        break;
      case 'portfolio_update':
        updateOrbHealth(message.payload);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const handleAgentAction = (action: any) => {
    const card: ReasoningCard = {
      id: generateId(),
      timestamp: Date.now(),
      title: action.thought_process || 'Analyzing opportunity...',
      description: action.description || 'The AI is evaluating market conditions',
      confidence_score: action.confidence_score || 0.75,
      status: 'analyzing',
      logs: [],
      action: action,
      expanded: false,
    };

    setReasoningCards((prev) => [...prev, card]);
    addLog('info', `New action: ${action.action_type}`, action.data);
  };

  const handleCommand = async (command: string, type: 'text' | 'voice') => {
    setIsProcessing(true);
    addLog('info', `Processing ${type} command: "${command}"`);

    try {
      // TODO: Send command to backend API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/command`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command, type }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        addLog('success', 'Command processed successfully');
        handleAgentAction(data.action);
      } else {
        addLog('error', 'Failed to process command');
      }
    } catch (error) {
      console.error('Command error:', error);
      addLog('error', 'Error processing command: ' + (error as Error).message);

      // Demo: Create mock reasoning card
      const mockCard: ReasoningCard = {
        id: generateId(),
        timestamp: Date.now(),
        title: `Analyzing: ${command}`,
        description: 'AI is evaluating your request and market conditions',
        confidence_score: 0.85,
        status: 'analyzing',
        logs: [
          { timestamp: Date.now(), level: 'info', message: 'Fetching market data...' },
          {
            timestamp: Date.now() + 1000,
            level: 'info',
            message: 'Analyzing yield opportunities...',
          },
        ],
        expanded: false,
      };
      setReasoningCards((prev) => [...prev, mockCard]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = async (actionId: string) => {
    addLog('info', `Executing quick action: ${actionId}`);
    setIsProcessing(true);

    try {
      // TODO: Send quick action to backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      addLog('success', `Quick action "${actionId}" completed`);
    } catch (error) {
      addLog('error', `Quick action failed: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    setSettings({ ...settings, ...newSettings });
    addLog('info', 'Settings updated');

    try {
      // TODO: Send settings update to backend
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (error) {
      console.error('Settings update error:', error);
    }
  };

  const handleKillSwitch = async () => {
    addLog('warning', 'KILL SWITCH ACTIVATED');

    try {
      // TODO: Execute kill switch via backend
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kill-switch`, {
        method: 'POST',
      });

      setSettings({ ...settings, autonomous_mode: false });
      addLog('success', 'All AI permissions revoked');
    } catch (error) {
      addLog('error', 'Kill switch failed: ' + (error as Error).message);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    addLog('info', 'Logs cleared');
  };

  const handleTerminalCommand = (command: string) => {
    addLog('info', `Terminal command: ${command}`);
  };

  const addLog = (
    level: 'info' | 'warning' | 'error' | 'success',
    message: string,
    data?: any
  ) => {
    const log: AgentLog = {
      timestamp: Date.now(),
      level,
      message,
      data,
    };
    setLogs((prev) => [...prev, log]);
  };

  const updateOrbHealth = (data: any) => {
    // Calculate health based on portfolio metrics
    const newHealth: OrbHealth = {
      ...orbHealth,
      score: data.health_score || orbHealth.score,
      status: data.status || orbHealth.status,
      factors: data.factors || orbHealth.factors,
    };
    setOrbHealth(newHealth);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* Left Sidebar - Guardrails */}
        <aside className="w-full lg:w-80 xl:w-96 border-r border-slate-800/50 p-4 lg:p-6 overflow-y-auto hidden lg:block">
          <GuardrailSidebar
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar with Asset Orb and Kill Switch */}
          <header className="flex items-start justify-between p-4 lg:p-6 border-b border-slate-800/50">
            <div className="flex items-center gap-6">
              <AssetOrb health={orbHealth} className="hidden md:block" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gradient-emerald mb-1">
                  SentientWallet
                </h1>
                <p className="text-sm text-slate-400">
                  AI-Powered Treasury Management
                </p>
              </div>
            </div>
            <KillSwitch
              onKillSwitch={handleKillSwitch}
              isActive={settings.autonomous_mode}
              className="hidden md:block"
            />
          </header>

          {/* Central Intelligence Feed */}
          <div className="flex-1 overflow-hidden p-4 lg:p-6">
            <IntelligenceFeed cards={reasoningCards} />
          </div>

          {/* Bottom Command Bar */}
          <footer className="p-4 lg:p-6 border-t border-slate-800/50 safe-bottom">
            <CommandBar
              onCommand={handleCommand}
              onQuickAction={handleQuickAction}
              isProcessing={isProcessing}
            />
          </footer>
        </main>

        {/* Right Sidebar - Log Terminal */}
        <aside className="w-full lg:w-80 xl:w-96 border-l border-slate-800/50 p-4 lg:p-6 overflow-y-auto hidden xl:block">
          <LogTerminal
            logs={logs}
            onClearLogs={handleClearLogs}
            onCommand={handleTerminalCommand}
          />
        </aside>
      </div>

      {/* Mobile Bottom Navigation (Optional) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-intense border-t border-slate-800 p-4 safe-bottom">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-500 transition-colors">
            <AssetOrb health={orbHealth} className="w-8 h-8" />
            <span className="text-xs">Status</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-500 transition-colors">
            <KillSwitch
              onKillSwitch={handleKillSwitch}
              isActive={settings.autonomous_mode}
              className="w-8 h-8"
            />
            <span className="text-xs">Kill</span>
          </button>
        </div>
      </div>
    </div>
  );
}
