import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function LoadingOverlay({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 space-y-6"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
          <Brain className="w-8 h-8 text-blue-400" />
        </div>
        <div className="absolute inset-0 w-16 h-16 rounded-2xl border-2 border-blue-500/30 animate-ping" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-white font-medium">{message || 'Analyzing market data...'}</p>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}