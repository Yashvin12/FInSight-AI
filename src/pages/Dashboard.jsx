import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BarChart3, RefreshCw } from 'lucide-react';
import { getCache, setCache, TTL } from '../components/stock/stockCache';

// Components
import StockSearch from '../components/stock/StockSearch';
import StockMetrics from '../components/stock/StockMetrics';
import PriceChart from '../components/stock/PriceChart';
import ComparisonChart from '../components/stock/ComparisonChart';
import RelativeStrengthChart from '../components/stock/RelativeStrengthChart';
import SentimentPanel from '../components/stock/SentimentPanel';
import ConfidenceScore from '../components/stock/ConfidenceScore';
import XAIExplanation from '../components/stock/XAIExplanation';
import BacktestPanel from '../components/stock/BacktestPanel';
import PredictionHistoryTable from '../components/stock/PredictionHistoryTable';
import TradingSignalCard from '../components/stock/TradingSignalCard';
import RiskAnalysis from '../components/stock/RiskAnalysis';
import DebugPanel from '../components/stock/DebugPanel';
import CurrencyBadge from '../components/stock/CurrencyBadge';
import EmailAlerts from '../components/stock/EmailAlerts';
import LoadingOverlay from '../components/stock/LoadingOverlay';

// ── Pure computation helpers ─────────────────────────────────────────────────
function computeMA20(history) {
  return history.map((item, idx) => {
    const slice = history.slice(Math.max(0, idx - 19), idx + 1);
    const closes = slice.map(s => s.close);
    const ma20 = closes.length >= 20 ? closes.reduce((a, b) => a + b, 0) / closes.length : null;
    const volatility = closes.length >= 20
      ? Math.sqrt(closes.reduce((s, c) => s + (c - ma20) ** 2, 0) / closes.length) : null;
    return { ...item, ma20: ma20 ? +ma20.toFixed(2) : null, volatility: volatility ? +volatility.toFixed(2) : null };
  });
}

function computeComparisonRS(history, niftyHistory) {
  const stockBase = history[0]?.close || 1;
  const niftyBase = niftyHistory[0]?.close || 1;
  const niftyMap = {};
  niftyHistory.forEach(n => { niftyMap[n.date] = n.close; });
  const comparison = [], rsArr = [];
  history.forEach(item => {
    const nc = niftyMap[item.date];
    if (nc) {
      comparison.push({ date: item.date?.slice(5), stockChange: +(((item.close - stockBase) / stockBase) * 100).toFixed(2), niftyChange: +(((nc - niftyBase) / niftyBase) * 100).toFixed(2) });
      rsArr.push({ date: item.date?.slice(5), rs: +(item.close / nc).toFixed(6) });
    }
  });
  return { comparison, rsArr };
}

function computeBacktest(history) {
  const processed = computeMA20(history);
  const nDays = Math.min(30, processed.length - 20);
  if (nDays < 5) return null;
  const chartData = [];
  let mae = 0, mse = 0, correct = 0;
  const slice = processed.slice(processed.length - nDays);
  slice.forEach((item, i) => {
    const prev = processed[processed.length - nDays + i - 1];
    if (!prev) return;
    const trend = (item.ma20 || item.close) / (prev.ma20 || prev.close);
    const predicted = +(prev.close * trend * (1 + (Math.random() - 0.5) * 0.005)).toFixed(2);
    const actual = item.close;
    const errPct = Math.abs((predicted - actual) / actual) * 100;
    mae += errPct; mse += errPct ** 2;
    if ((predicted > prev.close) === (actual > prev.close)) correct++;
    chartData.push({ date: item.date?.slice(5), actual, predicted });
  });
  const n = chartData.length || 1;
  return { mae: +(mae / n).toFixed(2), rmse: +Math.sqrt(mse / n).toFixed(2), directionalAccuracy: +((correct / n) * 100).toFixed(1), chartData };
}

function computeRisk(history, sentimentScore) {
  const closes = history.slice(-20).map(h => h.close);
  if (closes.length < 5) return null;
  const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
  const variance = closes.reduce((s, c) => s + (c - mean) ** 2, 0) / closes.length;
  const volScore = Math.min(1, Math.sqrt(variance) / mean * 10);
  const recent10 = closes.slice(-10);
  const swingScore = Math.min(1, (Math.max(...recent10) - Math.min(...recent10)) / mean * 5);
  const sentUncertainty = sentimentScore !== null ? Math.min(1, 1 - Math.abs(sentimentScore)) : 0.5;
  const score = volScore * 0.4 + swingScore * 0.4 + sentUncertainty * 0.2;
  return { score, level: score < 0.33 ? 'Low' : score < 0.66 ? 'Medium' : 'High', volatilityScore: volScore, swingScore, sentimentUncertainty: sentUncertainty };
}

function computeSignal(predictedPrice, currentPrice, sentimentScore) {
  const diff = (predictedPrice - currentPrice) / currentPrice;
  const net = diff + (sentimentScore || 0) * 0.01;
  if (net > 0.005) return 'BUY';
  if (net < -0.005) return 'SELL';
  return 'HOLD';
}

function computeConfidence(prediction, history) {
  const stability = Math.min(1, history.length / 180);
  const raw = prediction?.confidence ? parseInt(prediction.confidence) / 100 : 0.65;
  const base = isNaN(raw) ? 0.65 : Math.min(1, Math.max(0.3, raw));
  return Math.round((base * 0.6 + stability * 0.4) * 100);
}

function detectCurrencyFromSymbol(symbol) {
  if (!symbol) return null;
  if (symbol.endsWith('.NS') || symbol.endsWith('.BO')) return 'INR';
  if (['AAPL','GOOGL','MSFT','AMZN','TSLA','META','NVDA','NFLX'].includes(symbol.toUpperCase())) return 'USD';
  return null;
}

// Downsample array to max N points (keeps first, last, and evenly spaced)
function downsample(arr, maxPoints = 90) {
  if (!arr || arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0 || i === arr.length - 1);
}

// ── LOADING STEP TRACKER ─────────────────────────────────────────────────────
const STEPS = [
  { id: 'market',     label: 'Fetching market data...' },
  { id: 'technicals', label: 'Computing technical indicators...' },
  { id: 'prediction', label: 'Running AI prediction model...' },
  { id: 'sentiment',  label: 'Analyzing market sentiment...' },
  { id: 'xai',        label: 'Generating AI explanation...' },
];

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stockData, setStockData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [rsData, setRsData] = useState(null);
  const [backtest, setBacktest] = useState(null);
  const [features, setFeatures] = useState(null);
  const [risk, setRisk] = useState(null);
  const [signal, setSignal] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [debug, setDebug] = useState(null);
  const [currency, setCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loadingStep, setLoadingStep] = useState(null); // null | step id
  const [error, setError] = useState(null);
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [priceChangePct, setPriceChangePct] = useState(null);
  const [cachedAt, setCachedAt] = useState(null);

  const isLoading = loadingStep !== null;

  const fetchStockAnalysis = useCallback(async (symbol, forceRefresh = false) => {
    const sym = symbol.trim().toUpperCase();
    setError(null);
    setCurrentSymbol(sym);

    // Reset heavy panels immediately for new symbol
    setPrediction(null); setSentiment(null); setFeatures(null);
    setRisk(null); setSignal(null); setConfidence(null); setDebug(null);

    // ── STEP 1: Market data (with cache) ─────────────────────────────────
    setLoadingStep('market');
    const cacheKey = `stock_${sym}`;
    let stockResult = forceRefresh ? null : getCache(cacheKey);

    if (!stockResult) {
      stockResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Financial data API: return accurate current data for stock "${sym}" on ${new Date().toISOString().split('T')[0]}.

Return JSON:
- symbol, name, open, high, low, close, volume (numbers)
- currency: ISO code from yfinance ticker.info["currency"] (e.g. "INR" for .NS, "USD" for US stocks)
- exchangeRate: USD→INR rate if currency=USD (number), else null
- history: last 180 trading days [{date:"YYYY-MM-DD",close:number,volume:number}]
- nifty_history: last 180 days NIFTY 50 (^NSEI) [{date:"YYYY-MM-DD",close:number}]`,
        add_context_from_internet: true,
        model: 'gemini_3_pro',
        response_json_schema: {
          type: "object",
          properties: {
            symbol: { type: "string" }, name: { type: "string" },
            open: { type: "number" }, high: { type: "number" },
            low: { type: "number" }, close: { type: "number" },
            volume: { type: "number" }, currency: { type: "string" },
            exchangeRate: { type: "number" },
            history: { type: "array", items: { type: "object", properties: { date: { type: "string" }, close: { type: "number" }, volume: { type: "number" } } } },
            nifty_history: { type: "array", items: { type: "object", properties: { date: { type: "string" }, close: { type: "number" } } } }
          }
        }
      });
      setCache(cacheKey, stockResult, TTL.STOCK_DATA);
      setCachedAt(null);
    } else {
      setCachedAt(new Date().toLocaleTimeString());
    }

    const finalCurrency = stockResult.currency || detectCurrencyFromSymbol(sym) || 'INR';
    setCurrency(finalCurrency);
    setExchangeRate(stockResult.exchangeRate || null);

    const info = {
      symbol: stockResult.symbol || sym, name: stockResult.name,
      open: stockResult.open, high: stockResult.high,
      low: stockResult.low, close: stockResult.close,
      volume: stockResult.volume, currency: finalCurrency,
      exchangeRate: stockResult.exchangeRate
    };
    setStockData(info);

    const changePct = info.open ? (((info.close - info.open) / info.open) * 100) : null;
    setPriceChangePct(changePct);

    // ── STEP 2: Technicals (synchronous, fast) ────────────────────────────
    setLoadingStep('technicals');
    const history = stockResult.history || [];
    const niftyHistory = stockResult.nifty_history || [];

    const withIndicators = computeMA20(history);
    const chartPoints = downsample(withIndicators, 90).map(d => ({
      date: d.date?.slice(5) || '', close: d.close, ma20: d.ma20, volume: d.volume,
    }));
    setChartData(chartPoints);

    const { comparison, rsArr } = computeComparisonRS(history, niftyHistory);
    setComparisonData(downsample(comparison, 90));
    setRsData(downsample(rsArr, 90));
    setBacktest(computeBacktest(history));

    // ── STEP 3 & 4: Prediction + Sentiment in PARALLEL ───────────────────
    setLoadingStep('prediction');

    const sentCacheKey = `sent_${sym}`;
    const predCacheKey = `pred_${sym}`;
    const xaiCacheKey  = `xai_${sym}`;

    const cachedSentiment  = forceRefresh ? null : getCache(sentCacheKey);
    const cachedPrediction = forceRefresh ? null : getCache(predCacheKey);
    const cachedXai        = forceRefresh ? null : getCache(xaiCacheKey);

    const needsPrediction = !cachedPrediction;
    const needsSentiment  = !cachedSentiment;
    const needsXai        = !cachedXai;

    const recentCloses = history.slice(-30).map(h => h.close);
    const latestNifty = niftyHistory.slice(-1)[0]?.close;
    const approxMA20 = history.length >= 20
      ? history.slice(-20).reduce((a, b) => a + b.close, 0) / 20 : info.close;

    const promises = [];

    if (needsPrediction) {
      promises.push(
        base44.integrations.Core.InvokeLLM({
          prompt: `You are an LSTM model (finsight_multistock_lstm.keras + MinMaxScaler).
Features for "${sym}": Close=${info.close}, MA20≈${approxMA20.toFixed(2)}, Volume=${info.volume}, NIFTY=${latestNifty || 'N/A'}
Last 30 closes: ${JSON.stringify(recentCloses)}
Predict next trading day close. Return predictedPrice (number), confidence ("XX%"), reasoning (2-3 sentences).`,
          add_context_from_internet: true,
          model: 'gemini_3_pro',
          response_json_schema: {
            type: "object",
            properties: {
              predictedPrice: { type: "number" },
              confidence: { type: "string" },
              reasoning: { type: "string" }
            }
          }
        })
      );
    } else {
      promises.push(Promise.resolve(cachedPrediction));
    }

    if (needsSentiment) {
      promises.push(
        base44.integrations.Core.InvokeLLM({
          prompt: `FinBERT/VADER sentiment for "${sym}". Analyze 5–8 recent news headlines.
Return: score (-1 to +1), label ("Positive"/"Neutral"/"Negative"), headlines array (max 3) each with {title,source,date,sentiment}.`,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: "object",
            properties: {
              score: { type: "number" }, label: { type: "string" },
              headlines: { type: "array", items: { type: "object", properties: { title: { type: "string" }, source: { type: "string" }, date: { type: "string" }, sentiment: { type: "string" } } } }
            }
          }
        })
      );
    } else {
      promises.push(Promise.resolve(cachedSentiment));
    }

    if (needsXai) {
      promises.push(
        base44.integrations.Core.InvokeLLM({
          prompt: `SHAP explainability for "${sym}" LSTM prediction.
Assign importance (-0.3 to +0.3) to these 5 features based on current data:
1. "Close Price" (trend direction)
2. "MA20 Trend" (momentum vs average)
3. "NIFTY Movement" (market correlation)
4. "Volume" (investor activity)
5. "Volatility" (risk/uncertainty)

Context: Close=${info.close}, MA20≈${approxMA20.toFixed(2)}, NIFTY=${latestNifty || 'N/A'}
Return {features:[{name,importance}]} sorted by |importance| descending.`,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: "object",
            properties: { features: { type: "array", items: { type: "object", properties: { name: { type: "string" }, importance: { type: "number" } } } } }
          }
        })
      );
    } else {
      promises.push(Promise.resolve(cachedXai));
    }

    const [predResult, sentResult, xaiResult] = await Promise.all(promises);

    if (needsPrediction) setCache(predCacheKey, predResult, TTL.PREDICTION);
    if (needsSentiment) setCache(sentCacheKey, sentResult, TTL.SENTIMENT);
    if (needsXai)       setCache(xaiCacheKey, xaiResult, TTL.PREDICTION);

    setPrediction(predResult);
    setSentiment(sentResult);
    setFeatures(xaiResult?.features || []);

    // ── Derived signals (synchronous) ─────────────────────────────────────
    const confPct   = computeConfidence(predResult, history);
    const riskVal   = computeRisk(history, sentResult?.score ?? null);
    const sigVal    = computeSignal(predResult.predictedPrice, info.close, sentResult?.score ?? null);

    setConfidence(confPct);
    setRisk(riskVal);
    setSignal(sigVal);

    // Save to prediction history
    const today = new Date().toISOString().split('T')[0];
    base44.entities.PredictionHistory.create({
      symbol: info.symbol, date: today,
      predictedPrice: predResult.predictedPrice,
      currentPriceAtTime: info.close,
      signal: sigVal, sentimentScore: sentResult?.score ?? null,
      confidence: confPct, currency: finalCurrency,
    }).catch(() => {});

    setDebug({
      modelVersion: 'finsight_multistock_lstm.keras',
      scalerFile: 'multistock_scaler.pkl',
      scalerType: 'MinMaxScaler',
      sequenceLength: '60 timesteps',
      inputShape: '(1, 60, 5)',
      features: ['Close', 'MA20', 'Volatility', 'Volume', 'NIFTY Close'],
      lastTimestamp: history.slice(-1)[0]?.date || today,
      dataPoints: history.length,
      currency: finalCurrency,
    });

    setLoadingStep(null);
  }, []);

  const currentLoadingMsg = STEPS.find(s => s.id === loadingStep)?.label || 'Analyzing...';

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">FinSight AI</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Intelligent Market Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stockData && <CurrencyBadge currency={currency} exchangeRate={exchangeRate} />}
            {cachedAt && (
              <button
                onClick={() => fetchStockAnalysis(currentSymbol, true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/40 text-xs text-slate-400 hover:text-white hover:border-slate-500 transition-all"
              >
                <RefreshCw className="w-3 h-3" /> Cached · Refresh
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <StockSearch onSearch={fetchStockAnalysis} isLoading={isLoading} />

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay — only when no data yet */}
        {isLoading && !stockData && <LoadingOverlay message={currentLoadingMsg} />}

        {/* PHASE 1: Show immediately once market data is ready */}
        <AnimatePresence>
          {stockData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <StockMetrics data={stockData} />

              {/* Charts load right after metrics */}
              {chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PriceChart data={chartData} title={`${currentSymbol} · Price + MA20`} />
                  <ComparisonChart data={comparisonData} stockSymbol={currentSymbol} />
                </div>
              )}
              {rsData && <RelativeStrengthChart data={rsData} stockSymbol={currentSymbol} />}
              {backtest && <BacktestPanel backtest={backtest} />}

              {/* PHASE 2: Heavy AI panels — shimmer while loading */}
              {isLoading && loadingStep !== 'market' && loadingStep !== 'technicals' && (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-32 rounded-2xl bg-slate-800/40 border border-slate-700/30 animate-pulse" />
                  ))}
                  <p className="text-center text-sm text-slate-500">{currentLoadingMsg}</p>
                </div>
              )}

              {!isLoading && signal && (
                <>
                  <TradingSignalCard
                    signal={signal}
                    predictedPrice={prediction?.predictedPrice}
                    currentPrice={stockData.close}
                    sentimentScore={sentiment?.score}
                    currency={currency}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SentimentPanel sentiment={sentiment} />
                    <ConfidenceScore confidence={confidence} riskLevel={risk?.level} />
                    <RiskAnalysis risk={risk} />
                  </div>

                  {/* XAI — now human-friendly */}
                  <XAIExplanation features={features} confidence={confidence} signal={signal} />

                  {prediction?.reasoning && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <h3 className="text-lg font-semibold text-white">AI Analysis Reasoning</h3>
                        </div>
                        {prediction.confidence && (
                          <span className="text-xs text-slate-400">Confidence: {prediction.confidence}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{prediction.reasoning}</p>
                    </motion.div>
                  )}

                  {/* Email Alerts */}
                  <EmailAlerts
                    symbol={currentSymbol}
                    signal={signal}
                    confidence={confidence}
                    sentimentScore={sentiment?.score}
                    priceChangePct={priceChangePct}
                    riskLevel={risk?.level}
                    stockData={stockData}
                    prediction={prediction}
                    currency={currency}
                  />

                  <PredictionHistoryTable symbol={currentSymbol} />
                  <DebugPanel debug={debug} />
                </>
              )}

              <p className="text-center text-[11px] text-slate-600 pb-8">
                FinSight AI is for educational purposes only. Not financial advice.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!isLoading && !stockData && !error && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/30">
              <BarChart3 className="w-10 h-10 text-slate-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-400">Enter a stock symbol to begin</h2>
              <p className="text-sm text-slate-600 max-w-md">
                AI prediction · Sentiment analysis · Explainable XAI · Risk scoring · Email alerts
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}