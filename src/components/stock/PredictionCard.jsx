import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Zap } from 'lucide-react';

export default function PredictionCard({ prediction, currentPrice, currency, exchangeRate }) {
  if (!prediction) return null;

  const isBuy = prediction.predictedPrice > currentPrice;
  const signal = isBuy ? 'BUY' : 'SELL';
  const diff = ((prediction.predictedPrice - currentPrice) / currentPrice * 100).toFixed(2);
  const sym = currency === 'USD' ? '$' : '₹';
  const showConversion = currency === 'USD' && exchangeRate;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border p-6 ${
        isBuy
          ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500/30'
          : 'bg-gradient-to-br from-red-950/80 to-slate-900 border-red-500/30'
      }`}
    >
      {/* Glow effect */}
      <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 ${
        isBuy ? 'bg-emerald-500' : 'bg-red-500'
      }`} />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Prediction</h3>
            <p className="text-xs text-slate-400">LSTM Neural Network</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Predicted Next-Day Close</p>
            <p className="text-3xl font-bold text-white">
              {sym}{prediction.predictedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {showConversion && (
              <p className="text-xs text-slate-500 mt-0.5">(₹{(prediction.predictedPrice * exchangeRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })} approx)</p>
            )}
          </div>
          <div className="flex flex-col items-end justify-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${
              isBuy
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {isBuy ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {signal}
            </div>
            <p className={`text-sm mt-1 ${isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
              {isBuy ? '+' : ''}{diff}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <p className="text-xs text-slate-500">
            Based on 60-day sequence analysis with MA20, Volatility, Volume & NIFTY features
          </p>
        </div>
      </div>
    </motion.div>
  );
}