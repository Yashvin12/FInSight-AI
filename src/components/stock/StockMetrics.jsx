import React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

function MetricCard({ label, value, icon: Icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

export default function StockMetrics({ data }) {
  if (!data) return null;

  const sym = data.currency === 'USD' ? '$' : '₹';
  const showConv = data.currency === 'USD' && data.exchangeRate;
  const changePercent = data.close && data.open
    ? (((data.close - data.open) / data.open) * 100).toFixed(2)
    : null;
  const isPositive = changePercent >= 0;

  const formatNum = (n) => {
    if (n === null || n === undefined) return '—';
    return typeof n === 'number' ? n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : n;
  };

  const formatVolume = (v) => {
    if (!v) return '—';
    if (v >= 10000000) return (v / 10000000).toFixed(2) + ' Cr';
    if (v >= 100000) return (v / 100000).toFixed(2) + ' L';
    if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
    return v.toString();
  };

  return (
    <div className="space-y-4">
      {/* Header with symbol and change */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">{data.symbol}</h2>
          {data.name && <p className="text-sm text-slate-400">{data.name}</p>}
        </div>
        {changePercent !== null && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
            isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          }`}>
            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {isPositive ? '+' : ''}{changePercent}%
          </div>
        )}
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Open" value={`${sym}${formatNum(data.open)}`} icon={Activity} color="bg-blue-500/20 text-blue-400" delay={0.05} />
        <MetricCard label="High" value={`${sym}${formatNum(data.high)}`} icon={TrendingUp} color="bg-emerald-500/20 text-emerald-400" delay={0.1} />
        <MetricCard label="Low" value={`${sym}${formatNum(data.low)}`} icon={TrendingDown} color="bg-red-500/20 text-red-400" delay={0.15} />
        <MetricCard label="Close" value={`${sym}${formatNum(data.close)}${showConv ? ` (₹${(data.close * data.exchangeRate).toLocaleString('en-IN', {maximumFractionDigits:0})})` : ''}`} icon={Activity} color="bg-purple-500/20 text-purple-400" delay={0.2} />
        <MetricCard label="Volume" value={formatVolume(data.volume)} icon={BarChart3} color="bg-amber-500/20 text-amber-400" delay={0.25} />
      </div>
    </div>
  );
}