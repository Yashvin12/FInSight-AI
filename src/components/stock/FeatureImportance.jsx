import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

const FEATURE_COLORS = {
  'Close Price': '#3b82f6',
  'MA20 Trend': '#f59e0b',
  'NIFTY Movement': '#a855f7',
  'Volume': '#06b6d4',
  'Volatility': '#f97316',
};

export default function FeatureImportance({ features }) {
  if (!features || features.length === 0) return null;

  const max = Math.max(...features.map(f => Math.abs(f.importance)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">Explainable AI (XAI)</h3>
          <p className="text-xs text-slate-400">Prediction Drivers — Feature Importance</p>
        </div>
      </div>

      <div className="space-y-3">
        {features.map((f, i) => {
          const pct = (Math.abs(f.importance) / max) * 100;
          const color = FEATURE_COLORS[f.name] || '#60a5fa';
          const positive = f.importance >= 0;
          return (
            <div key={f.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 w-4">{i + 1}</span>
                  <span className="text-sm text-slate-200">{f.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">{(f.importance * 100).toFixed(1)}%</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${positive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {positive ? '+' : '−'}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-600 mt-4 pt-3 border-t border-slate-700/50">
        Importance values derived from SHAP-like analysis. Positive = bullish factor, Negative = bearish factor.
      </p>
    </motion.div>
  );
}