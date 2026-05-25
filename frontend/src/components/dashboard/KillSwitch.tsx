'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Power,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KillSwitchProps {
  onKillSwitch: () => Promise<void>;
  isActive?: boolean;
  className?: string;
}

export function KillSwitch({
  onKillSwitch,
  isActive = true,
  className = '',
}: KillSwitchProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<'confirm' | 'execute' | 'complete'>('confirm');

  const handleKillSwitchClick = () => {
    setShowConfirmDialog(true);
    setStep('confirm');
    setConfirmText('');
  };

  const handleConfirm = async () => {
    if (confirmText !== 'STOP') return;

    setStep('execute');
    setIsExecuting(true);

    try {
      await onKillSwitch();
      setStep('complete');

      // Auto-close after success
      setTimeout(() => {
        setShowConfirmDialog(false);
        setIsExecuting(false);
        setStep('confirm');
      }, 2000);
    } catch (error) {
      console.error('Kill switch error:', error);
      setIsExecuting(false);
      setStep('confirm');
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setConfirmText('');
    setStep('confirm');
  };

  return (
    <>
      {/* Kill Switch Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`kill-switch ${className}`}
      >
        <motion.button
          onClick={handleKillSwitchClick}
          disabled={!isActive || isExecuting}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`kill-switch-button group relative ${
            !isActive ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {/* Animated Border Ring */}
          {isActive && (
            <motion.div
              className="kill-switch-guard"
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
          )}

          {/* Button Content */}
          <div className="relative z-10">
            <motion.div
              animate={{
                rotate: isActive ? [0, 5, -5, 0] : 0,
              }}
              transition={{
                duration: 2,
                repeat: isActive ? Infinity : 0,
                ease: 'easeInOut',
              }}
            >
              <Power
                className={`w-10 h-10 ${
                  isActive ? 'text-red-500' : 'text-slate-600'
                }`}
              />
            </motion.div>

            {/* Glow Effect */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/30 blur-xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </div>

          {/* Hover Tooltip */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="glass depth-2 rounded-lg px-3 py-2 whitespace-nowrap">
              <p className="text-xs font-semibold text-red-400">Emergency Stop</p>
              <p className="text-[10px] text-slate-400">Revoke all AI permissions</p>
            </div>
          </div>
        </motion.button>

        {/* Status Label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-center"
        >
          <p className="text-xs font-medium text-slate-400">
            {isActive ? 'Kill Switch Armed' : 'Kill Switch Inactive'}
          </p>
        </motion.div>
      </motion.div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-intense depth-4 rounded-2xl max-w-md w-full overflow-hidden"
            >
              {step === 'confirm' && (
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-100">
                          Emergency Kill Switch
                        </h3>
                        <p className="text-xs text-slate-400">
                          This action cannot be undone
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCancel}
                      className="text-slate-400 hover:text-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Warning Message */}
                  <div className="space-y-3 mb-6">
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-sm text-red-400 font-medium mb-2">
                        ⚠️ Warning: This will immediately:
                      </p>
                      <ul className="text-xs text-red-400/80 space-y-1 ml-4">
                        <li>• Revoke all AI permissions from your Safe multi-sig</li>
                        <li>• Cancel all pending transactions</li>
                        <li>• Stop all autonomous operations</li>
                        <li>• Require manual re-authorization to resume</li>
                      </ul>
                    </div>

                    <p className="text-sm text-slate-300">
                      Your funds will remain safe in your wallet. Only AI access will be revoked.
                    </p>
                  </div>

                  {/* Confirmation Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Type <span className="text-red-500 font-bold">STOP</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                      placeholder="STOP"
                      autoFocus
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-center text-lg font-bold tracking-widest focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={confirmText !== 'STOP'}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Power className="w-4 h-4 mr-2" />
                      Execute Kill Switch
                    </Button>
                  </div>
                </div>
              )}

              {step === 'execute' && (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">
                    Executing Kill Switch...
                  </h3>
                  <p className="text-sm text-slate-400">
                    Revoking AI permissions and stopping all operations
                  </p>
                  <div className="mt-4 space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2 text-xs text-slate-300"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Cancelling pending transactions...</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-2 text-xs text-slate-300"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Revoking Safe permissions...</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center gap-2 text-xs text-slate-300"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Stopping AI agent...</span>
                    </motion.div>
                  </div>
                </div>
              )}

              {step === 'complete' && (
                <div className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">
                    Kill Switch Executed
                  </h3>
                  <p className="text-sm text-slate-400">
                    All AI permissions have been revoked successfully
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
