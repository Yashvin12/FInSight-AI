import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';

export default function TradingSignalCard({ signal, predictedPrice, currentPrice, sentimentScore, currency }) {
  if (!signal) return null;

  const sym = currency === 'USD' ? '$' : '₹';
  const fmt = (n) => n?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cfg = {
    BUY: {
      label: 'BUY',
      Icon: TrendingUp,
      bg: 'from-emerald-950/80 to-slate-900',
      border: 'border-emerald-500/30',
      glow: 'bg-emerald-500',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 border-emerald-500/30',
    },
    SELL: {
      label: 'SELL',
      Icon: TrendingDown,
      bg: 'from-red-950/80 to-slate-900',
      border: 'border-red-500/30',
      glow: 'bg-red-500',
      text: 'text-red-400',
      badge: 'bg-red-500/20 border-red-500/30',
    },
    HOLD: {
      label: 'HOLD',
      Icon: Minus,
      bg: 'from-amber-950/80 to-slate-900',
      border: 'border-amber-500/30',
      glow: 'bg-amber-500',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 border-amber-500/30',
    },
  };

  const c = cfg[signal] || cfg.HOLD;
  const Icon = c.Icon;
  const diff = predictedPrice && currentPrice
    ? (((predictedPrice - currentPrice) / currentPrice) * 100).toFixed(2)
    : null;

  const reasons = [];
  if (predictedPrice && currentPrice) {
    reasons.push(predictedPrice > currentPrice
      ? `Model forecasts +${Math.abs(diff)}% upside`
      : `Model forecasts −${Math.abs(diff)}% downside`);
  }
  if (sentimentScore !== null && sentimentScore !== undefined) {
    reasons.push(sentimentScore > 0.2 ? 'Positive news sentiment supports signal'
      : sentimentScore < -0.2 ? 'Negative sentiment adds conviction'
      : 'Neutral market sentiment');
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${c.bg} ${c.border} p-6`}
    >
      <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 ${c.glow}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-800/50">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Trading Signal</h3>
              <p className="text-xs text-slate-400">Composite AI + Sentiment</p>
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xl border ${c.badge} ${c.text}`}
          >
            <Icon className="w-6 h-6" />
            {c.label}
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-400">Current Price</p>
            <p className="text-xl font-bold text-white">{sym}{fmt(currentPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">AI Predicted</p>
            <p className={`text-xl font-bold ${c.text}`}>{sym}{fmt(predictedPrice)}</p>
          </div>
        </div>

        {diff !== null && (
          <div className={`mb-4 px-3 py-2 rounded-lg ${c.badge} border`}>
            <p className={`text-sm font-medium ${c.text}`}>
              Expected move: {diff >= 0 ? '+' : ''}{diff}%
            </p>
          </div>
        )}

        {reasons.length > 0 && (
          <div className="space-y-1.5 pt-3 border-t border-slate-700/40">
            {reasons.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.glow}`} />
                <p className="text-xs text-slate-300">{r}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}