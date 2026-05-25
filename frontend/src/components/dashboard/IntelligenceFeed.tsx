'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Brain,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { ReasoningCard as ReasoningCardType, AgentLog } from '@/types';
import { timeAgo, formatUSD, getConfidenceColor, getConfidenceBgColor } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface IntelligenceFeedProps {
  cards: ReasoningCardType[];
  onExpandCard?: (cardId: string) => void;
  className?: string;
}

export function IntelligenceFeed({ cards, onExpandCard, className = '' }: IntelligenceFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new cards arrive
  useEffect(() => {
    if (autoScroll && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [cards, autoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold text-slate-100">Intelligence Feed</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </div>
          <span>•</span>
          <span>{cards.length} actions</span>
        </div>
      </div>

      {/* Feed Container */}
      <div
        ref={feedRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-4 pr-2"
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        <AnimatePresence initial={false}>
          {cards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <Brain className="w-16 h-16 text-slate-700 mb-4" />
              <p className="text-slate-400 text-sm">
                Waiting for AI agent activity...
              </p>
              <p className="text-slate-500 text-xs mt-2">
                The agent will analyze market conditions and suggest actions
              </p>
            </motion.div>
          ) : (
            cards.map((card, index) => (
              <ReasoningCard
                key={card.id}
                card={card}
                index={index}
                onExpand={onExpandCard}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Auto-scroll indicator */}
      {!autoScroll && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={() => {
            setAutoScroll(true);
            if (feedRef.current) {
              feedRef.current.scrollTop = feedRef.current.scrollHeight;
            }
          }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 glass depth-2 rounded-full px-4 py-2 text-xs text-slate-300 hover:text-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4" />
            <span>New Activity</span>
          </div>
        </motion.button>
      )}
    </div>
  );
}

interface ReasoningCardProps {
  card: ReasoningCardType;
  index: number;
  onExpand?: (cardId: string) => void;
}

function ReasoningCard({ card, index, onExpand }: ReasoningCardProps) {
  const [isExpanded, setIsExpanded] = useState(card.expanded);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand?.(card.id);
  };

  const getStatusIcon = () => {
    switch (card.status) {
      case 'thinking':
        return <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />;
      case 'analyzing':
        return <Brain className="w-5 h-5 text-emerald-500 animate-pulse" />;
      case 'simulating':
        return <Zap className="w-5 h-5 text-gold-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Brain className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusLabel = () => {
    const labels = {
      thinking: 'Thinking',
      analyzing: 'Analyzing',
      simulating: 'Simulating',
      completed: 'Completed',
      failed: 'Failed',
    };
    return labels[card.status] || 'Unknown';
  };

  const getStatusColor = () => {
    const colors = {
      thinking: 'text-slate-400',
      analyzing: 'text-emerald-500',
      simulating: 'text-gold-500',
      completed: 'text-emerald-500',
      failed: 'text-red-500',
    };
    return colors[card.status] || 'text-slate-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="reasoning-card cursor-pointer" onClick={handleToggleExpand}>
        {/* Card Header */}
        <div className="reasoning-card-header">
          <div className="flex items-start gap-3 flex-1">
            {getStatusIcon()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="reasoning-card-title truncate">{card.title}</h3>
                <span className={`text-xs font-medium ${getStatusColor()}`}>
                  {getStatusLabel()}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(card.timestamp)}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleExpand();
            }}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Card Body */}
        <div className="reasoning-card-body">
          <p className="text-slate-300">{card.description}</p>

          {/* Confidence Score */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-slate-400">Confidence Score</span>
              <span className={`font-semibold ${getConfidenceColor(card.confidence_score)}`}>
                {Math.round(card.confidence_score * 100)}%
              </span>
            </div>
            <div className="confidence-bar">
              <motion.div
                className={`confidence-bar-fill ${getConfidenceBgColor(card.confidence_score)}`}
                initial={{ width: 0 }}
                animate={{ width: `${card.confidence_score * 100}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>

          {/* Action Details (if available) */}
          {card.action && (
            <div className="mt-3 glass depth-1 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Action Type</span>
                <span className="text-xs font-semibold text-emerald-500">
                  {card.action.action_type}
                </span>
              </div>
              {card.action.data.token_in && card.action.data.token_out && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Tokens</span>
                  <span className="text-xs text-slate-300">
                    {card.action.data.token_in} → {card.action.data.token_out}
                  </span>
                </div>
              )}
              {card.action.data.protocol && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Protocol</span>
                  <span className="text-xs text-slate-300">
                    {card.action.data.protocol}
                  </span>
                </div>
              )}
              {card.action.requires_approval && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-gold-500/10 rounded">
                  <AlertCircle className="w-4 h-4 text-gold-500" />
                  <span className="text-xs text-gold-500">Requires Your Approval</span>
                </div>
              )}
            </div>
          )}

          {/* Expanded Content - Logs */}
          <AnimatePresence>
            {isExpanded && card.logs.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 terminal">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-900/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-500">
                      Execution Logs
                    </span>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {card.logs.map((log, idx) => (
                      <LogEntry key={idx} log={log} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

interface LogEntryProps {
  log: AgentLog;
}

function LogEntry({ log }: LogEntryProps) {
  const getLogIcon = () => {
    switch (log.level) {
      case 'info':
        return '➜';
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      default:
        return '•';
    }
  };

  const getLogClass = () => {
    switch (log.level) {
      case 'info':
        return 'terminal-output';
      case 'success':
        return 'terminal-success';
      case 'warning':
        return 'terminal-warning';
      case 'error':
        return 'terminal-error';
      default:
        return 'terminal-output';
    }
  };

  return (
    <div className="terminal-line">
      <span className="terminal-prompt">{getLogIcon()}</span>
      <span className={getLogClass()}>
        <span className="text-slate-500 text-[10px] mr-2">
          {new Date(log.timestamp).toLocaleTimeString()}
        </span>
        {log.message}
        {log.data && (
          <span className="block ml-4 mt-1 text-[10px] text-slate-500">
            {JSON.stringify(log.data, null, 2)}
          </span>
        )}
      </span>
    </div>
  );
}
