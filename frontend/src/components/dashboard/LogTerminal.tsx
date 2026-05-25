'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  X,
  Maximize2,
  Minimize2,
  Download,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';
import { AgentLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LogTerminalProps {
  logs: AgentLog[];
  onClearLogs?: () => void;
  onCommand?: (command: string) => void;
  className?: string;
}

export function LogTerminal({
  logs,
  onClearLogs,
  onCommand,
  className = '',
}: LogTerminalProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch =
      !searchQuery ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    // Add to history
    setCommandHistory([...commandHistory, commandInput]);
    setHistoryIndex(-1);

    // Handle built-in commands
    if (commandInput === '/clear') {
      onClearLogs?.();
    } else if (commandInput === '/stop') {
      onCommand?.('/stop');
    } else if (commandInput === '/help') {
      // Show help
      const helpLog: AgentLog = {
        timestamp: Date.now(),
        level: 'info',
        message: 'Available commands: /clear (clear logs), /stop (stop AI), /help (show help)',
      };
      // Would need to add this to logs
    } else {
      onCommand?.(commandInput);
    }

    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommandInput('');
        } else {
          setHistoryIndex(newIndex);
          setCommandInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const handleDownloadLogs = () => {
    const logText = logs
      .map(
        (log) =>
          `[${formatDate(log.timestamp, true)}] [${log.level.toUpperCase()}] ${
            log.message
          }`
      )
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentient-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogIcon = (level: string) => {
    switch (level) {
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

  const getLogClass = (level: string) => {
    switch (level) {
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col h-full ${className}`}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold text-slate-100">Log Terminal</h2>
          <div className="flex items-center gap-1 ml-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-gold-500" />
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownloadLogs}
            className="w-8 h-8 text-slate-400 hover:text-slate-100"
            title="Download logs"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearLogs}
            className="w-8 h-8 text-slate-400 hover:text-red-400"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 text-slate-400 hover:text-slate-100"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-2 mb-3">
        {/* Filter Buttons */}
        <div className="flex items-center gap-1 glass depth-1 rounded-lg p-1">
          {(['all', 'info', 'success', 'warning', 'error'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === level
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Terminal Content */}
      <div
        className={`flex-1 terminal transition-all duration-300 ${
          isExpanded ? 'max-h-[80vh]' : 'max-h-[400px]'
        }`}
      >
        <div
          ref={terminalRef}
          className="h-full overflow-y-auto space-y-1"
          style={{ scrollbarGutter: 'stable' }}
        >
          <AnimatePresence initial={false}>
            {filteredLogs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full text-slate-500 text-sm"
              >
                {searchQuery || filter !== 'all'
                  ? 'No logs match your filters'
                  : 'No logs yet. The AI will log its actions here.'}
              </motion.div>
            ) : (
              filteredLogs.map((log, index) => (
                <motion.div
                  key={`${log.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="terminal-line"
                >
                  <span className="terminal-prompt">{getLogIcon(log.level)}</span>
                  <span className={getLogClass(log.level)}>
                    <span className="text-slate-500 text-[10px] mr-2">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    {log.message}
                    {log.data && (
                      <pre className="ml-4 mt-1 text-[10px] text-slate-500 overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Command Input */}
      <form onSubmit={handleCommand} className="mt-3">
        <div className="terminal p-3">
          <div className="flex items-center gap-2">
            <span className="terminal-prompt text-emerald-500">$</span>
            <input
              ref={inputRef}
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command... (try /help)"
              className="flex-1 bg-transparent border-none outline-none text-slate-100 text-sm placeholder:text-slate-600"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>Commands: /stop, /clear, /help</span>
          <span className="flex items-center gap-2">
            <span>Use ↑↓ for history</span>
            <span>•</span>
            <span>{filteredLogs.length} logs</span>
          </span>
        </div>
      </form>
    </motion.div>
  );
}
