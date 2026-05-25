'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  DollarSign,
  Fuel,
  List,
  Settings,
  AlertTriangle,
  Check,
  X,
  Info,
} from 'lucide-react';
import { UserSettings, ProtocolWhitelist } from '@/types';
import { formatUSD } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GuardrailSidebarProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  className?: string;
}

export function GuardrailSidebar({
  settings,
  onUpdateSettings,
  className = '',
}: GuardrailSidebarProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggleAutonomous = () => {
    const newValue = !localSettings.autonomous_mode;
    setLocalSettings({ ...localSettings, autonomous_mode: newValue });
    setHasChanges(true);
  };

  const handleSpendLimitChange = (value: number) => {
    setLocalSettings({ ...localSettings, daily_spend_limit: value });
    setHasChanges(true);
  };

  const handleGasPriceChange = (value: number) => {
    setLocalSettings({ ...localSettings, max_gas_price: value });
    setHasChanges(true);
  };

  const handleToggleProtocol = (protocolId: string) => {
    const updatedWhitelist = localSettings.whitelist.map((protocol) =>
      protocol.protocol === protocolId
        ? { ...protocol, enabled: !protocol.enabled }
        : protocol
    );
    setLocalSettings({ ...localSettings, whitelist: updatedWhitelist });
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    onUpdateSettings(localSettings);
    setHasChanges(false);
  };

  const handleResetChanges = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const getRiskLevelColor = (level: string) => {
    const colors = {
      conservative: 'text-emerald-500',
      moderate: 'text-gold-500',
      aggressive: 'text-red-500',
    };
    return colors[level as keyof typeof colors] || 'text-slate-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`h-full flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <Shield className="w-6 h-6 text-emerald-500" />
        <div>
          <h2 className="text-xl font-bold text-slate-100">Guardrails</h2>
          <p className="text-xs text-slate-400">Safety & Permissions</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Autonomous Mode Toggle */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Operating Mode
            </CardTitle>
            <CardDescription>
              Control how the AI executes actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Toggle Switch */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-100 mb-1">
                    {localSettings.autonomous_mode ? 'Autonomous' : 'Manual Approval'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {localSettings.autonomous_mode
                      ? 'AI executes actions automatically'
                      : 'You approve each action'}
                  </p>
                </div>
                <button
                  onClick={handleToggleAutonomous}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.autonomous_mode
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.autonomous_mode
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Warning for Autonomous Mode */}
              {localSettings.autonomous_mode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-3 bg-gold-500/10 rounded-lg"
                >
                  <AlertTriangle className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gold-400">
                    <p className="font-medium mb-1">Autonomous Mode Active</p>
                    <p className="text-gold-500/80">
                      The AI can execute transactions within your set guardrails
                      without asking for approval.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget Limits */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget Limits
            </CardTitle>
            <CardDescription>
              Set spending constraints for AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Daily Spend Limit */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-100">
                  Daily Spend Limit
                </label>
                <span className="text-sm font-semibold text-emerald-500">
                  {formatUSD(localSettings.daily_spend_limit)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={localSettings.daily_spend_limit}
                onChange={(e) => handleSpendLimitChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>$0</span>
                <span>$10,000</span>
              </div>
            </div>

            {/* Max Gas Price */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-100 flex items-center gap-1">
                  <Fuel className="w-3 h-3" />
                  Max Gas Price
                </label>
                <span className="text-sm font-semibold text-emerald-500">
                  {localSettings.max_gas_price} Gwei
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={localSettings.max_gas_price}
                onChange={(e) => handleGasPriceChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>10 Gwei</span>
                <span>200 Gwei</span>
              </div>
              <div className="flex items-start gap-2 mt-2 p-2 bg-slate-800/50 rounded">
                <Info className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-400">
                  Transactions will be aborted if gas exceeds this limit
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protocol Whitelist */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <List className="w-4 h-4" />
              Protocol Whitelist
            </CardTitle>
            <CardDescription>
              Select which protocols AI can interact with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {localSettings.whitelist.map((protocol) => (
                <ProtocolItem
                  key={protocol.protocol}
                  protocol={protocol}
                  onToggle={() => handleToggleProtocol(protocol.protocol)}
                />
              ))}
            </div>

            {/* Enabled Count */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Enabled Protocols</span>
                <span className="font-semibold text-slate-300">
                  {localSettings.whitelist.filter((p) => p.enabled).length} /{' '}
                  {localSettings.whitelist.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Management
            </CardTitle>
            <CardDescription>
              Configure risk tolerance and limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Risk Tolerance</span>
                <span
                  className={`text-sm font-semibold capitalize ${getRiskLevelColor(
                    localSettings.risk_tolerance
                  )}`}
                >
                  {localSettings.risk_tolerance}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Target APY</span>
                <span className="text-sm font-semibold text-emerald-500">
                  {localSettings.target_apy}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Max Drawdown</span>
                <span className="text-sm font-semibold text-red-500">
                  {localSettings.max_drawdown}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save/Reset Actions */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 glass depth-3 rounded-lg p-4 space-y-2"
        >
          <p className="text-xs text-slate-400 mb-3">You have unsaved changes</p>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveChanges}
              variant="default"
              size="sm"
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={handleResetChanges}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

interface ProtocolItemProps {
  protocol: ProtocolWhitelist;
  onToggle: () => void;
}

function ProtocolItem({ protocol, onToggle }: ProtocolItemProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
        protocol.enabled
          ? 'glass depth-1 hover:depth-2'
          : 'bg-slate-900/50 opacity-50 hover:opacity-70'
      }`}
    >
      {/* Protocol Logo */}
      <div className="relative">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            protocol.enabled ? 'bg-slate-800' : 'bg-slate-900'
          }`}
        >
          {protocol.logo ? (
            <img
              src={protocol.logo}
              alt={protocol.name}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <span className="text-xs font-bold text-slate-400">
              {protocol.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        {/* Enabled Indicator */}
        {protocol.enabled && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Protocol Info */}
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-slate-100">{protocol.name}</p>
        <p className="text-xs text-slate-400">
          {protocol.chains.length} chain{protocol.chains.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Toggle Indicator */}
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center ${
          protocol.enabled
            ? 'bg-emerald-500/20 text-emerald-500'
            : 'bg-slate-800 text-slate-600'
        }`}
      >
        {protocol.enabled ? (
          <Check className="w-3 h-3" />
        ) : (
          <X className="w-3 h-3" />
        )}
      </div>
    </motion.button>
  );
}
