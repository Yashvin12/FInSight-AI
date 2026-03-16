import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

function RiskFactor({ label, value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">{(pct).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function RiskAnalysis({ risk }) {
  if (!risk) return null;

  const { level, score, volatilityScore, swingScore, sentimentUncertainty } = risk;

  const levelCfg = {
    Low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', glow: '#10b981', Icon: CheckCircle },
    Medium: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', glow: '#f59e0b', Icon: Info },
    High: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', glow: '#ef4444', Icon: AlertTriangle },
  };

  const c = levelCfg[level] || levelCfg.Medium;
  const Icon = c.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Risk Analysis</h3>
      </div>

      <div className={`flex items-center gap-3 p-3 rounded-xl border ${c.bg}`}>
        <Icon className={`w-6 h-6 ${c.color}`} />
        <div>
          <p className={`text-lg font-bold ${c.color}`}>{level} Risk</p>
          <p className="text-xs text-slate-400">Composite risk score: {(score * 100).toFixed(0)}/100</p>
        </div>
      </div>

      <div className="space-y-3">
        <RiskFactor label="Volatility Risk" value={volatilityScore} max={1} color="#f97316" />
        <RiskFactor label="Price Swing Risk" value={swingScore} max={1} color="#ef4444" />
        <RiskFactor label="Sentiment Uncertainty" value={sentimentUncertainty} max={1} color="#a855f7" />
      </div>

      <p className="text-xs text-slate-600 pt-2 border-t border-slate-700/50">
        Risk is calculated from 20-day volatility, max price swing over 10 days, and sentiment divergence.
      </p>
    </motion.div>
  );
}