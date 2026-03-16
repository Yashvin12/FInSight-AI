import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const POPULAR_STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance' },
  { symbol: 'TCS.NS', name: 'TCS' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'GOOGL', name: 'Google' },
];

export default function StockSearch({ onSearch, isLoading }) {
  const [symbol, setSymbol] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol.trim()) onSearch(symbol.trim().toUpperCase());
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter stock symbol (e.g. RELIANCE.NS, AAPL)"
            className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 h-12 text-base"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !symbol.trim()}
          className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Analyze
            </>
          )}
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {POPULAR_STOCKS.map((stock) => (
          <button
            key={stock.symbol}
            onClick={() => { setSymbol(stock.symbol); onSearch(stock.symbol); }}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
          >
            {stock.name}
          </button>
        ))}
      </div>
    </div>
  );
}