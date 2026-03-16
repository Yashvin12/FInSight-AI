import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

const FEATURE_MAP = {
  'Close Price':      { friendly: 'Recent stock price movement',  desc: (v) => v > 0 ? 'The stock price has been trending upward recently.' : 'The stock price has been declining recently.' },
  'MA20 Trend':       { friendly: 'Short-term price trend',        desc: (v) => v > 0 ? 'The short-term trend is stronger than the long-term average.' : 'The short-term trend is weaker than the long-term average.' },
  'NIFTY Movement':   { friendly: 'Overall market trend',          desc: (v) => v > 0 ? 'The overall market (NIFTY) is also moving up, supporting the stock.' : 'The broader market is declining, creating headwinds.' },
  'Volume':           { friendly: 'Trading activity',              desc: (v) => v > 0 ? 'Investor interest and trading activity is increasing.' : 'Trading volume recently dropped, suggesting lower interest.' },
  'Volatility':       { friendly: 'Market uncertainty',            desc: (v) => v > 0 ? 'Price swings are stabilising, reducing uncertainty.' : 'Market uncertainty has increased, adding risk.' },
};

function FactorRow({ feature, index }) {
  const mapped = FEATURE_MAP[feature.name] || { friendly: feature.name, desc: () => '' };
  const isPositive = feature.importance > 0;
  const isNeutral = Math.abs(feature.importance) < 0.05;
  const pct = Math.abs(feature.importance * 100).toFixed(1);

  const emoji = isNeutral ? '➖' : isPositive ? '📈' : '📉';
  const colorClass = isNeutral ? 'text-slate-400' : isPositive ? 'text-emerald-400' : 'text-red-400';
  const barColor = isNeutral ? '#64748b' : isPositive ? '#10b981' : '#ef4444';
  const bgClass = isNeutral ? 'bg-slate-800/40 border-slate-700/30'
    : isPositive ? 'bg-emerald-950/40 border-emerald-500/20'
    : 'bg-red-950/40 border-red-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`flex items-start gap-3 p-3 rounded-xl border ${bgClass}`}
    >
      <span className="text-lg flex-shrink-0 mt-0.5">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm font-medium ${colorClass}`}>{mapped.friendly}</p>
          <span className="text-xs font-mono text-slate-500 flex-shrink-0">{isPositive ? '+' : isNeutral ? '' : '−'}{pct}%</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{mapped.desc(feature.importance)}</p>
        <div className="mt-2 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: barColor }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (Math.abs(feature.importance) / 0.3) * 100)}%` }}
            transition={{ duration: 0.7, delay: index * 0.08 + 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function XAIExplanation({ features, confidence, signal }) {
  const [showAll, setShowAll] = useState(false);
  if (!features || features.length === 0) return null;

  const bullish = features.filter(f => f.importance > 0.05);
  const bearish = features.filter(f => f.importance < -0.05);
  const neutral = features.filter(f => Math.abs(f.importance) <= 0.05);

  const confNum = typeof confidence === 'string' ? parseInt(confidence) : confidence;
  const confReason = confNum >= 75
    ? 'Most indicators align and support the prediction direction.'
    : confNum >= 50
    ? 'Some indicators agree, but there is meaningful uncertainty.'
    : 'Indicators are mixed — treat this prediction with caution.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/15 flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Prediction Explanation</h3>
          <p className="text-xs text-slate-400">Plain-language breakdown of why the AI made this prediction</p>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2">
        {bullish.length > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            📈 {bullish.length} Bullish Factor{bullish.length > 1 ? 's' : ''}
          </span>
        )}
        {bearish.length > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20">
            📉 {bearish.length} Bearish Factor{bearish.length > 1 ? 's' : ''}
          </span>
        )}
        {neutral.length > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-700/60 text-slate-400 border border-slate-600/30">
            ➖ {neutral.length} Neutral
          </span>
        )}
      </div>

      {/* Bullish section */}
      {bullish.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Why the AI thinks the stock may {signal === 'SELL' ? 'hold value' : 'rise'}:
          </p>
          {bullish.map((f, i) => <FactorRow key={f.name} feature={f} index={i} />)}
        </div>
      )}

      {/* Bearish section */}
      {bearish.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">
            ⚠ Factors that may slow or reverse the stock:
          </p>
          {bearish.map((f, i) => <FactorRow key={f.name} feature={f} index={i} />)}
        </div>
      )}

      {/* Neutral — collapsible */}
      {neutral.length > 0 && (
        <div>
          <button
            onClick={() => setShowAll(o => !o)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showAll ? 'Hide' : 'Show'} neutral factors
          </button>
          <AnimatePresence>
            {showAll && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2 space-y-2"
              >
                {neutral.map((f, i) => <FactorRow key={f.name} feature={f} index={i} />)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Confidence explanation */}
      {confNum != null && !isNaN(confNum) && (
        <div className="pt-3 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Confidence Explanation</p>
            <span className={`text-sm font-bold ${confNum >= 75 ? 'text-emerald-400' : confNum >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {confNum}%
            </span>
          </div>
          <p className="text-sm text-slate-300">{confReason}</p>
        </div>
      )}
    </motion.div>
  );
}