import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Tender } from '../types';
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, Activity, Users, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [tenders, setTenders] = useState<Tender[]>([]);

  useEffect(() => {
    api.getTenders().then(setTenders);
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white glow-text">Overview Dashboard</h1>
        <p className="text-gray-400 mt-2">Active procurement tenders and AI evaluation status.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-50"><Briefcase className="w-16 h-16 text-primary" /></div>
          <p className="text-sm font-medium text-gray-400">Active Tenders</p>
          <p className="text-4xl font-bold text-white mt-2 neon-text">8</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-50"><Users className="w-16 h-16 text-accent" /></div>
          <p className="text-sm font-medium text-gray-400">Bids Processed (Today)</p>
          <p className="text-4xl font-bold text-white mt-2 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">124</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-50"><Activity className="w-16 h-16 text-warning" /></div>
          <p className="text-sm font-medium text-gray-400">Cases Needing Review</p>
          <p className="text-4xl font-bold text-white mt-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">12</p>
        </motion.div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Recent Tenders
        </h2>
        <div className="space-y-4">
          {tenders.map((tender, i) => (
            <motion.div 
              key={tender.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-panel p-6 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-all border border-border/50 hover:border-primary/50"
            >
              <div>
                <p className="text-xs font-mono text-primary mb-1 tracking-wider">{tender.id}</p>
                <h3 className="text-lg font-semibold text-white">{tender.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{tender.department} • {tender.criteria.length} Criteria Extracted</p>
              </div>
              <Link 
                to={`/tenders/${tender.id}/workbench`}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary/20 text-primary font-medium rounded-lg hover:bg-primary/30 transition-all group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                Go to Workbench
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
          {tenders.length === 0 && (
             <div className="p-8 text-center glass-panel rounded-xl text-gray-500">
               Loading Tenders...
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
