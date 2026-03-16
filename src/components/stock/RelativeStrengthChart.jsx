import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color }} className="font-medium">
          RS: {typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function RelativeStrengthChart({ data, stockSymbol }) {
  if (!data || data.length === 0) return null;

  const avg = data.reduce((sum, d) => sum + (d.rs || 0), 0) / data.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5"
    >
      <h3 className="text-lg font-semibold text-white mb-1">Relative Strength vs NIFTY</h3>
      <p className="text-xs text-slate-400 mb-4">Rising = outperforming NIFTY · Falling = underperforming</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="rsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={avg} stroke="#64748b" strokeDasharray="3 3" label={{ value: 'Avg', fill: '#64748b', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="rs"
              name="Relative Strength"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#rsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}