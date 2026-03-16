import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((e, i) => (
        <p key={i} style={{ color: e.color }} className="font-medium">
          {e.name}: {typeof e.value === 'number' ? e.value.toFixed(2) : e.value}
        </p>
      ))}
    </div>
  );
};

function MetricBadge({ label, value, color }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-3 text-center">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

export default function BacktestPanel({ backtest }) {
  if (!backtest) return null;
  const { mae, rmse, directionalAccuracy, chartData } = backtest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-5"
    >
      <div className="flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-purple-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">Backtesting & Model Accuracy</h3>
          <p className="text-xs text-slate-400">Historical prediction performance</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricBadge label="MAE" value={`${mae?.toFixed(2)}%`} color="#3b82f6" />
        <MetricBadge label="RMSE" value={`${rmse?.toFixed(2)}%`} color="#a855f7" />
        <MetricBadge label="Directional Accuracy" value={`${directionalAccuracy?.toFixed(0)}%`} color="#10b981" />
      </div>

      {chartData?.length > 0 && (
        <div className="h-64">
          <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">Predicted vs Actual Prices</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Line type="monotone" dataKey="actual" name="Actual" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="text-xs text-slate-600 pt-2 border-t border-slate-700/50 space-y-1">
        <p><span className="text-slate-400">MAE</span> — Mean Absolute Error as % of price</p>
        <p><span className="text-slate-400">RMSE</span> — Root Mean Square Error as % of price</p>
        <p><span className="text-slate-400">Directional Accuracy</span> — % of days model correctly predicted up/down movement</p>
      </div>
    </motion.div>
  );
}