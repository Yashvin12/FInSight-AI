import React from 'react';
import { Coins } from 'lucide-react';

export default function CurrencyBadge({ currency, exchangeRate }) {
  if (!currency) return null;
  const isUSD = currency === 'USD';
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-xs text-slate-300">
        <Coins className="w-3 h-3 text-amber-400" />
        <span>Currency: <strong className="text-white">{currency}</strong></span>
        <span className="text-slate-500">{isUSD ? 'USD $' : 'INR ₹'}</span>
      </div>
      {isUSD && exchangeRate && (
        <span className="text-xs text-slate-500">1 USD ≈ ₹{exchangeRate.toFixed(0)}</span>
      )}
    </div>
  );
}