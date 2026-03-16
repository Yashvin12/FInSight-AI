import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';

function SentimentBar({ score }) {
  const pct = ((score + 1) / 2) * 100;
  const color = score > 0.2 ? '#10b981' : score < -0.2 ? '#ef4444' : '#f59e0b';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>Negative</span><span>Neutral</span><span>Positive</span>
      </div>
      <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full bg-red-500/20 border-r border-slate-600" />
          <div className="w-1/3 h-full bg-amber-500/20 border-r border-slate-600" />
          <div className="w-1/3 h-full bg-emerald-500/20" />
        </div>
        <motion.div
          initial={{ left: '50%' }}
          animate={{ left: `${Math.max(4, Math.min(96, pct))}%` }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="absolute top-0 -translate-x-1/2 w-4 h-3 rounded-full border-2 border-white shadow-lg"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export default function SentimentPanel({ sentiment }) {
  if (!sentiment) return null;

  const { score, label, headlines } = sentiment;
  const Icon = score > 0.2 ? TrendingUp : score < -0.2 ? TrendingDown : Minus;
  const colorClass = score > 0.2 ? 'text-emerald-400' : score < -0.2 ? 'text-red-400' : 'text-amber-400';
  const bgClass = score > 0.2 ? 'bg-emerald-500/10 border-emerald-500/20' : score < -0.2 ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Market Sentiment</h3>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{score >= 0 ? '+' : ''}{score.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Sentiment Score</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-base ${bgClass} ${colorClass}`}>
          <Icon className="w-4 h-4" />
          {label}
        </div>
      </div>

      <SentimentBar score={score} />

      {headlines?.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-700/50">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Top News Headlines</p>
          {headlines.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-slate-900/50 border border-slate-700/30"
            >
              <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                h.sentiment === 'positive' ? 'bg-emerald-500' :
                h.sentiment === 'negative' ? 'bg-red-500' : 'bg-amber-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 leading-snug">{h.title}</p>
                {h.source && <p className="text-xs text-slate-500 mt-0.5">{h.source} · {h.date}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}