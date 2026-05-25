'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Send,
  Wand2,
  Loader2,
  AlertCircle,
  TrendingUp,
  Shield,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickAction } from '@/types';
import { isSpeechRecognitionSupported } from '@/lib/utils';

interface CommandBarProps {
  onCommand: (command: string, type: 'text' | 'voice') => void;
  onQuickAction: (actionId: string) => void;
  isProcessing?: boolean;
  className?: string;
}

export function CommandBar({
  onCommand,
  onQuickAction,
  isProcessing = false,
  className = '',
}: CommandBarProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    {
      id: 'rebalance',
      label: 'Rebalance Portfolio',
      icon: 'refresh',
      description: 'Optimize asset allocation',
      action: () => handleQuickAction('rebalance'),
      enabled: !isProcessing,
    },
    {
      id: 'harvest',
      label: 'Harvest Rewards',
      icon: 'trending-up',
      description: 'Claim all pending rewards',
      action: () => handleQuickAction('harvest'),
      enabled: !isProcessing,
    },
    {
      id: 'reduce-risk',
      label: 'Reduce Risk',
      icon: 'shield',
      description: 'Move to safer positions',
      action: () => handleQuickAction('reduce-risk'),
      enabled: !isProcessing,
    },
    {
      id: 'emergency-exit',
      label: 'Emergency Exit',
      icon: 'log-out',
      description: 'Exit all positions immediately',
      action: () => handleQuickAction('emergency-exit'),
      enabled: !isProcessing,
    },
  ];

  // Initialize speech recognition
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      setVoiceError('Voice commands not supported in this browser');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          handleVoiceCommand(transcriptText);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceError(`Voice error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleVoiceCommand = (command: string) => {
    if (command.trim()) {
      onCommand(command, 'voice');
      setTranscript('');
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setVoiceError('Voice recognition not available');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        setVoiceError('Failed to start voice input');
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onCommand(input, 'text');
      setInput('');
    }
  };

  const handleQuickAction = (actionId: string) => {
    onQuickAction(actionId);
    setShowQuickActions(false);
  };

  const getQuickActionIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      refresh: <RefreshCw className="w-5 h-5" />,
      'trending-up': <TrendingUp className="w-5 h-5" />,
      shield: <Shield className="w-5 h-5" />,
      'log-out': <LogOut className="w-5 h-5" />,
    };
    return icons[iconName] || <Wand2 className="w-5 h-5" />;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Voice Transcript Display */}
      <AnimatePresence>
        {(isListening && transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-4 left-0 right-0 glass depth-2 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <Mic className="w-5 h-5 text-emerald-500 animate-pulse" />
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">Listening...</p>
                <p className="text-sm text-slate-100">{transcript}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Error Display */}
      <AnimatePresence>
        {voiceError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-4 left-0 right-0 glass depth-2 rounded-lg p-3 bg-red-500/10"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs text-red-400">{voiceError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions Menu */}
      <AnimatePresence>
        {showQuickActions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowQuickActions(false)}
            />

            {/* Quick Actions Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-full mb-4 left-0 right-0 z-50 glass-intense depth-4 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-100">Quick Actions</h3>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <span className="text-xs">ESC</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={action.action}
                    disabled={!action.enabled}
                    className={`quick-action text-left ${
                      !action.enabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-emerald-500">
                        {getQuickActionIcon(action.icon)}
                      </div>
                      <span className="text-sm font-medium text-slate-100">
                        {action.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{action.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Command Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="command-bar"
      >
        <form onSubmit={handleTextSubmit} className="flex items-center gap-3 flex-1">
          {/* Voice Input Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleVoiceInput}
            disabled={isProcessing || !!voiceError}
            className={`relative ${isListening ? 'text-emerald-500' : 'text-slate-400'}`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              </>
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening...'
                : 'Ask AI to manage your portfolio...'
            }
            disabled={isProcessing || isListening}
            className="command-input"
          />

          {/* Processing Indicator */}
          {isProcessing && (
            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          )}

          {/* Submit Button */}
          {!isProcessing && input.trim() && (
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="text-emerald-500 hover:text-emerald-400"
            >
              <Send className="w-5 h-5" />
            </Button>
          )}

          {/* Quick Actions Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowQuickActions(!showQuickActions)}
            disabled={isProcessing}
            className={`text-slate-400 hover:text-emerald-500 ${
              showQuickActions ? 'text-emerald-500' : ''
            }`}
          >
            <Wand2 className="w-5 h-5" />
          </Button>
        </form>
      </motion.div>

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-500"
      >
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-0.5 bg-slate-800 rounded text-[10px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-0.5 bg-slate-800 rounded text-[10px]">K</kbd>
          <span className="ml-1">Focus</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-0.5 bg-slate-800 rounded text-[10px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-0.5 bg-slate-800 rounded text-[10px]">M</kbd>
          <span className="ml-1">Voice</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-0.5 bg-slate-800 rounded text-[10px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-0.5 bg-slate-800 rounded text-[10px]">Space</kbd>
          <span className="ml-1">Quick Actions</span>
        </span>
      </motion.div>
    </div>
  );
}
