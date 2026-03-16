import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';

export default function DebugPanel({ debug }) {
  const [open, setOpen] = useState(false);
  if (!debug) return null;

  const rows = [
    ['Model', debug.modelVersion || 'finsight_multistock_lstm.keras'],
    ['Scaler', debug.scalerFile || 'multistock_scaler.pkl'],
    ['Sequence Length', debug.sequenceLength || '60 timesteps'],
    ['Input Shape', debug.inputShape || '(1, 60, 5)'],
    ['Features', debug.features?.join(', ') || 'Close, MA20, Volatility, Volume, NIFTY'],
    ['Last Data Timestamp', debug.lastTimestamp || new Date().toISOString()],
    ['Data Points', debug.dataPoints || '—'],
    ['Scaler Type', debug.scalerType || 'MinMaxScaler'],
    ['Prediction Latency', debug.latency ? `${debug.latency}ms` : '—'],
    ['Currency Detected', debug.currency || '—'],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-900/80 border border-slate-700/40 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-5 py-3 text-left hover:bg-slate-800/40 transition-colors"
      >
        <Terminal className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium text-slate-300">Developer Insights</span>
        <span className="ml-2 text-xs text-slate-600 font-mono">debug panel</span>
        <div className="ml-auto text-slate-500">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-slate-700/40">
              <div className="mt-3 font-mono text-xs space-y-1.5">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <span className="text-green-500/80 w-44 flex-shrink-0">{k}</span>
                    <span className="text-slate-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}