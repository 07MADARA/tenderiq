import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { VerdictStatus } from '../types';
import type { Tender, BidderEvaluation, CriterionVerdict } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, FileSearch, Check } from 'lucide-react';

export default function EvaluationWorkbench() {
  const { id } = useParams<{ id: string }>();
  const [tender, setTender] = useState<Tender | null>(null);
  const [evaluations, setEvaluations] = useState<BidderEvaluation[]>([]);
  const [selectedBidderId, setSelectedBidderId] = useState<string | null>(null);
  const [selectedCriterionId, setSelectedCriterionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([api.getTender(id), api.getEvaluations(id)]).then(([t, e]) => {
        setTender(t);
        setEvaluations(e);
        if (e.length > 0) setSelectedBidderId(e[0].bidder_id);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <div className="flex h-full items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  const selectedBidder = evaluations.find(b => b.bidder_id === selectedBidderId);
  const selectedVerdict = selectedBidder?.criterion_verdicts.find(c => c.criterion_id === selectedCriterionId);

  const getStatusColor = (status: VerdictStatus) => {
    switch(status) {
      case VerdictStatus.ELIGIBLE: return 'text-secondary bg-secondary/10 border-secondary/20';
      case VerdictStatus.NOT_ELIGIBLE: return 'text-danger bg-danger/10 border-danger/20';
      case VerdictStatus.NEEDS_REVIEW: return 'text-warning bg-warning/10 border-warning/20';
    }
  };

  const getStatusIcon = (status: VerdictStatus) => {
    switch(status) {
      case VerdictStatus.ELIGIBLE: return <CheckCircle2 className="w-5 h-5 text-secondary" />;
      case VerdictStatus.NOT_ELIGIBLE: return <XCircle className="w-5 h-5 text-danger" />;
      case VerdictStatus.NEEDS_REVIEW: return <AlertTriangle className="w-5 h-5 text-warning" />;
    }
  };

  const handleOverride = async (verdictId: string, newStatus: VerdictStatus) => {
    if (id && selectedBidderId) {
      await api.overrideVerdict(id, selectedBidderId, verdictId, newStatus);
      // Refresh
      const newEvals = await api.getEvaluations(id);
      setEvaluations(newEvals);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition"><ArrowLeft className="w-5 h-5"/></Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Evaluation Workbench</h1>
            <p className="text-sm font-mono text-primary">{tender?.id} • {tender?.title}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Bidders List */}
        <div className="col-span-3 glass-panel rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-white/5 font-semibold">Bidders ({evaluations.length})</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {evaluations.map(bidder => (
              <button
                key={bidder.bidder_id}
                onClick={() => setSelectedBidderId(bidder.bidder_id)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                  selectedBidderId === bidder.bidder_id 
                  ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'border-transparent hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="font-medium text-white truncate">{bidder.bidder_name}</div>
                  <div className="text-xs text-gray-400 font-mono mt-1">{bidder.bidder_id}</div>
                </div>
                {getStatusIcon(bidder.overall_status)}
              </button>
            ))}
          </div>
        </div>

        {/* Middle Column: Criteria Validation */}
        <div className="col-span-4 glass-panel rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-white/5 font-semibold flex items-center justify-between">
            <span>Criteria Assessment</span>
            {selectedBidder && (
               <span className={`px-2.5 py-1 text-xs rounded-full border flex items-center gap-1 ${getStatusColor(selectedBidder.overall_status)}`}>
                 {selectedBidder.overall_status.replace('_', ' ').toUpperCase()}
               </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedBidder?.criterion_verdicts.map(verdict => {
              const criterionDetail = tender?.criteria.find(c => c.id === verdict.criterion_id);
              const isSelected = selectedCriterionId === verdict.criterion_id;
              return (
                <motion.div 
                  key={verdict.criterion_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedCriterionId(verdict.criterion_id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected ? 'border-primary/50 bg-primary/5' : 'border-border/30 hover:border-border/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getStatusIcon(verdict.status)}</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-200">
                        {criterionDetail?.description}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-2 flex items-center gap-2">
                        <span>Crit: {verdict.criterion_id}</span>
                        {criterionDetail?.is_mandatory && <span className="bg-red-500/20 text-red-300 px-1.5 rounded">MANDATORY</span>}
                      </div>
                      {verdict.status === VerdictStatus.NEEDS_REVIEW && (
                        <div className="mt-3 text-sm text-warning/90 bg-warning/10 p-2 rounded border border-warning/20">
                          AI HALT: {verdict.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Evidence & Human Override */}
        <div className="col-span-5 glass-panel rounded-xl flex flex-col overflow-hidden">
           <div className="p-4 border-b border-border/50 bg-white/5 font-semibold flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-primary" />
              Evidence Viewer
           </div>
           <div className="flex-1 overflow-y-auto p-6 bg-black/40">
              <AnimatePresence mode="wait">
                {selectedVerdict ? (
                  <motion.div key={selectedVerdict.criterion_id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    <h3 className="text-lg font-medium text-white mb-4">Extracted Evidence</h3>
                    
                    <div className="bg-white/5 border border-border/50 rounded-lg p-5 mb-6 relative">
                       <div className="absolute top-0 right-0 bg-primary/20 text-primary text-xs font-mono px-2 py-1 rounded-bl-lg">
                         Page {selectedVerdict.evidence?.page_number}
                       </div>
                       <blockquote className="text-gray-300 italic border-l-2 border-primary pl-4 font-serif relative z-10">
                         "{selectedVerdict.evidence?.document_snippet}"
                       </blockquote>
                       {selectedVerdict.status === VerdictStatus.NEEDS_REVIEW && (
                          <div className="mt-4 flex items-center justify-center p-8 border-2 border-dashed border-warning/30 rounded bg-warning/5">
                             <div className="text-center">
                               <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2 opacity-50" />
                               <span className="text-warning/70 text-sm">Low Confidence Match / Blurred Scan</span>
                             </div>
                          </div>
                       )}
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">AI Reason:</h4>
                      <p className="text-sm text-gray-200">{selectedVerdict.explanation}</p>
                    </div>

                    {selectedVerdict.status === VerdictStatus.NEEDS_REVIEW && (
                      <div className="p-5 border border-warning/50 rounded-xl bg-warning/5 backdrop-blur-sm">
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          Manual Action Required
                        </h4>
                        <p className="text-sm text-gray-400 mb-4">
                          The autonomous agent could not reach a high-confidence verdict. Please review the physical document and override the status.
                        </p>
                        <div className="flex gap-3 mt-4">
                          <button 
                            onClick={() => handleOverride(selectedVerdict.criterion_id, VerdictStatus.ELIGIBLE)}
                            className="flex-1 flex items-center justify-center gap-2 bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/50 py-2 rounded transition"
                          >
                            <Check className="w-4 h-4" /> Override as Eligible
                          </button>
                          <button 
                            onClick={() => handleOverride(selectedVerdict.criterion_id, VerdictStatus.NOT_ELIGIBLE)}
                            className="flex-1 flex items-center justify-center gap-2 bg-danger/20 hover:bg-danger/30 text-danger border border-danger/50 py-2 rounded transition"
                          >
                            <XCircle className="w-4 h-4" /> Reject Evidence
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-4">
                    <FileSearch className="w-16 h-16 opacity-20" />
                    <p>Select a criterion to view evidence.</p>
                  </div>
                )}
              </AnimatePresence>
           </div>
        </div>

      </div>
    </div>
  );
}
