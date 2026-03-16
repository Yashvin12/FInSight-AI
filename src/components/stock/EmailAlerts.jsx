import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Mail, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ALERT_OPTIONS = [
  { key: 'buySignal',          label: 'BUY signal triggered',       default: true },
  { key: 'sellSignal',         label: 'SELL signal triggered',      default: true },
  { key: 'largePriceMove',     label: 'Large price move (>3%)',     default: true },
  { key: 'negativeSentiment',  label: 'Sentiment turns negative',   default: false },
  { key: 'highRisk',           label: 'High risk warning',          default: false },
  { key: 'highConfidence',     label: 'Prediction confidence >80%', default: true },
];

const FREQ_OPTIONS = [
  { value: 'instant', label: 'Instant', desc: 'As events happen' },
  { value: 'daily',   label: 'Daily',   desc: 'Once per day summary' },
  { value: 'weekly',  label: 'Weekly',  desc: 'Weekly digest' },
];

export default function EmailAlerts({ symbol, signal, confidence, sentimentScore, priceChangePct, riskLevel, stockData, prediction, currency }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('instant');
  const [alerts, setAlerts] = useState(Object.fromEntries(ALERT_OPTIONS.map(a => [a.key, a.default])));
  const [status, setStatus] = useState(null); // 'saving' | 'success' | 'error'
  const [existing, setExisting] = useState(null);

  // Check if already subscribed for this email+symbol
  const checkExisting = async (emailVal, sym) => {
    if (!emailVal || !sym) return;
    const results = await base44.entities.EmailSubscription.filter({ email: emailVal, symbol: sym });
    if (results.length > 0) setExisting(results[0]);
  };

  // Send alert email when triggering conditions are met
  useEffect(() => {
    if (!existing || !stockData || !symbol) return;
    const sym = currency === 'USD' ? '$' : '₹';
    const priceSymbol = sym;

    const triggers = [];
    if (existing.alerts?.buySignal && signal === 'BUY') triggers.push('AI Buy Signal triggered');
    if (existing.alerts?.sellSignal && signal === 'SELL') triggers.push('AI Sell Signal triggered');
    if (existing.alerts?.largePriceMove && Math.abs(priceChangePct || 0) > 3) triggers.push(`Large price movement: ${priceChangePct?.toFixed(1)}%`);
    if (existing.alerts?.negativeSentiment && (sentimentScore || 0) < -0.3) triggers.push('Sentiment turned negative');
    if (existing.alerts?.highRisk && riskLevel === 'High') triggers.push('High risk detected');
    if (existing.alerts?.highConfidence && (confidence || 0) >= 80) triggers.push(`High confidence prediction: ${confidence}%`);

    if (triggers.length === 0 || existing.frequency !== 'instant') return;

    // Rate-limit: check last alert time (simple session guard)
    const lastKey = `finsight_alert_${existing.id}`;
    const last = sessionStorage.getItem(lastKey);
    if (last && Date.now() - parseInt(last) < 5 * 60 * 1000) return;
    sessionStorage.setItem(lastKey, Date.now().toString());

    const body = `
FinSight AI Stock Alert

Stock: ${symbol}
Current Price: ${priceSymbol}${stockData.close?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
${prediction?.predictedPrice ? `AI Prediction: ${priceSymbol}${prediction.predictedPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : ''}

Signal: ${signal || 'N/A'}

Triggers:
${triggers.map(t => `• ${t}`).join('\n')}

${prediction?.reasoning ? `Reasoning:\n${prediction.reasoning.slice(0, 300)}...` : ''}

Confidence: ${confidence || 'N/A'}%

---
FinSight AI · Educational purposes only. Not financial advice.
    `.trim();

    base44.integrations.Core.SendEmail({
      to: existing.email,
      subject: `FinSight AI Alert: ${symbol} — ${signal || 'Update'}`,
      body,
    }).catch(() => {});
  }, [signal, confidence, sentimentScore, riskLevel]);

  const handleSave = async () => {
    if (!email || !email.includes('@')) { setStatus('error'); return; }
    setStatus('saving');
    const data = { email, symbol, frequency, alerts, active: true, lastAlertSent: null };
    if (existing) {
      await base44.entities.EmailSubscription.update(existing.id, data);
    } else {
      const rec = await base44.entities.EmailSubscription.create(data);
      setExisting(rec);
    }
    setStatus('success');
    setTimeout(() => setStatus(null), 3000);
  };

  const handleUnsubscribe = async () => {
    if (!existing) return;
    await base44.entities.EmailSubscription.update(existing.id, { active: false });
    setExisting(null);
    setStatus(null);
    setEmail('');
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-700/30 transition-colors"
      >
        <div className="p-2 rounded-lg bg-blue-500/15">
          <Bell className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-white">Email Alerts</p>
          <p className="text-xs text-slate-400">
            {existing ? `Active — ${existing.email} · ${existing.frequency}` : 'Get notified of important signals'}
          </p>
        </div>
        {existing && <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />}
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-700/50"
          >
            <div className="p-5 space-y-5">
              {/* Email input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Your Email</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); checkExisting(e.target.value, symbol); }}
                      placeholder="you@example.com"
                      className="pl-9 bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-600 h-9 text-sm"
                    />
                  </div>
                </div>
                {symbol && <p className="text-xs text-slate-500">Alerts for: <strong className="text-slate-300">{symbol}</strong></p>}
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Alert Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {FREQ_OPTIONS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setFrequency(f.value)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        frequency === f.value
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                          : 'bg-slate-900/50 border-slate-700/40 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <p className="text-xs font-semibold">{f.label}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert types */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Notify me when</label>
                <div className="space-y-2">
                  {ALERT_OPTIONS.map(opt => (
                    <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => setAlerts(a => ({ ...a, [opt.key]: !a[opt.key] }))}
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                          alerts[opt.key]
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-transparent border-slate-600 group-hover:border-slate-400'
                        }`}
                      >
                        {alerts[opt.key] && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm text-slate-300">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleSave}
                  disabled={status === 'saving' || !email}
                  className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  {status === 'saving' ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : status === 'success' ? (
                    <><Check className="w-4 h-4 mr-1.5" /> Saved!</>
                  ) : (
                    <><Bell className="w-4 h-4 mr-1.5" /> {existing ? 'Update Alerts' : 'Subscribe'}</>
                  )}
                </Button>
                {existing && (
                  <Button
                    onClick={handleUnsubscribe}
                    variant="outline"
                    className="h-9 px-3 border-slate-600 text-slate-400 hover:text-red-400 hover:border-red-500/50 text-sm"
                  >
                    <BellOff className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {status === 'error' && (
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5" /> Please enter a valid email address.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}