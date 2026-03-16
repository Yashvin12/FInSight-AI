import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

function CircleProgress({ pct, color }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="96" height="96" className="-rotate-90">
      <circle cx="48" cy="48" r={r} stroke="#1e293b" strokeWidth="8" fill="none" />
      <motion.circle
        cx="48" cy="48" r={r}
        stroke={color}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

export default function ConfidenceScore({ confidence, riskLevel }) {
  if (confidence === null || confidence === undefined) return null;

  const pct = Math.round(confidence);
  const level = pct >= 75 ? 'High' : pct >= 50 ? 'Medium' : 'Low';
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const Icon = pct >= 75 ? ShieldCheck : pct >= 50 ? Shield : ShieldAlert;

  const riskColor = riskLevel === 'Low' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : riskLevel === 'High' ? 'text-red-400 bg-red-500/10 border-red-500/20'
    : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Confidence & Risk</h3>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <CircleProgress pct={pct} color={color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{pct}%</span>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <p className="text-xs text-slate-400">Prediction Confidence</p>
            <p className="text-lg font-bold" style={{ color }}>{level} Confidence</p>
          </div>

          {riskLevel && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Risk Assessment</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${riskColor}`}>
                {riskLevel} Risk
              </span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-1.5">
            {[['Low', '#10b981'], ['Med', '#f59e0b'], ['High', '#ef4444']].map(([l, c]) => (
              <div key={l} className="text-center py-1 rounded-lg" style={{
                background: level === l || (l === 'Med' && level === 'Medium') ? `${c}20` : 'transparent',
                border: `1px solid ${(level === l || (l === 'Med' && level === 'Medium')) ? c + '40' : '#334155'}`
              }}>
                <p className="text-xs font-medium" style={{ color: (level === l || (l === 'Med' && level === 'Medium')) ? c : '#64748b' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}