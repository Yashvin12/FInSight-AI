import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

function SignalBadge({ signal }) {
  const cfg = {
    BUY: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    SELL: 'bg-red-500/15 text-red-400 border-red-500/30',
    HOLD: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  };
  const Icon = signal === 'BUY' ? TrendingUp : signal === 'SELL' ? TrendingDown : Minus;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg[signal] || cfg['HOLD']}`}>
      <Icon className="w-3 h-3" />{signal}
    </span>
  );
}

export default function PredictionHistoryTable({ symbol }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!symbol) return;
    base44.entities.PredictionHistory.filter({ symbol })
      .then(data => setRecords(data.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)));
  }, [symbol]);

  const formatPrice = (p, currency) => {
    if (!p) return '—';
    const sym = currency === 'USD' ? '$' : '₹';
    return `${sym}${p.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  if (records.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Prediction History</h3>
        <span className="ml-auto text-xs text-slate-500">{records.length} records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              {['Date', 'Predicted', 'Actual', 'Error %', 'Signal', 'Confidence'].map(h => (
                <th key={h} className="text-left pb-2 px-2 text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => {
              const hasActual = r.actualPrice != null;
              const err = hasActual && r.errorPercent != null ? r.errorPercent : null;
              const errColor = err === null ? 'text-slate-500' : Math.abs(err) < 2 ? 'text-emerald-400' : Math.abs(err) < 5 ? 'text-amber-400' : 'text-red-400';
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="py-2.5 px-2 text-slate-300">{r.date}</td>
                  <td className="py-2.5 px-2 font-medium text-white">{formatPrice(r.predictedPrice, r.currency)}</td>
                  <td className="py-2.5 px-2 text-slate-300">{hasActual ? formatPrice(r.actualPrice, r.currency) : <span className="text-slate-600 italic">Pending</span>}</td>
                  <td className={`py-2.5 px-2 font-medium ${errColor}`}>{err !== null ? `${err >= 0 ? '+' : ''}${err.toFixed(2)}%` : '—'}</td>
                  <td className="py-2.5 px-2">{r.signal ? <SignalBadge signal={r.signal} /> : '—'}</td>
                  <td className="py-2.5 px-2 text-slate-300">{r.confidence != null ? `${Math.round(r.confidence)}%` : '—'}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}