import React, { useEffect, useState } from 'react';
import { History, RefreshCw, Box, Layers } from 'lucide-react';
import { getExperimentsHistory, ExperimentData } from '../lib/cloudStorage';
import { auth } from '../lib/firebase';

interface ExperimentHistoryProps {
  themeColor: string;
  onRestore: (data: Partial<ExperimentData>) => void;
}

export default function ExperimentHistory({ themeColor, onRestore }: ExperimentHistoryProps) {
  const [history, setHistory] = useState<ExperimentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadHistory = async () => {
    setIsLoading(true);
    const data = await getExperimentsHistory();
    setHistory(data);
    setIsLoading(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadHistory();
      } else {
        setHistory([]);
      }
    });
    return unsubscribe;
  }, []);

  if (!auth.currentUser) {
    return (
      <div className="glass-panel p-6 rounded-2xl border-white/10 text-center">
        <History className="w-8 h-8 text-white/30 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white mb-2">سجل التجارب السابقة</h3>
        <p className="text-xs text-white/60 mb-4">قم بتسجيل الدخول لحفظ واسترجاع تجاربك من السحابة.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel border-white/10 p-6 rounded-2xl shadow-xl flex flex-col h-full max-h-[400px]">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
          <History className="w-4 h-4" />
          سجل التجارب (Firestore)
        </h3>
        <button 
          onClick={loadHistory}
          disabled={isLoading}
          className="text-white/50 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {history.length === 0 && !isLoading && (
          <div className="text-center text-white/40 text-xs py-8">لا توجد تجارب محفوظة بعد.</div>
        )}
        
        {history.map((exp, idx) => (
          <div key={exp.id || idx} className="bg-black/40 border border-white/5 rounded-lg p-3 hover:border-white/20 transition-all flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-white/50 font-mono">
                {new Date(exp.timestamp || exp.createdAt?.toDate()).toLocaleString()}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${exp.isEquilibrium ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'}`}>
                {exp.isEquilibrium ? 'متوازن' : 'غير متوازن'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex gap-1 items-center">
                <Box className="w-3 h-3 text-white/40" />
                <span className="text-white/80">{exp.weightKg} كجم</span>
              </div>
              <div className="flex gap-1 items-center">
                <Layers className="w-3 h-3 text-white/40" />
                <span className="text-white/80">{exp.distanceMm} ملم</span>
              </div>
            </div>

            <button 
              onClick={() => onRestore(exp)}
              className="mt-2 w-full py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-[10px] uppercase tracking-widest rounded transition-colors"
              style={{ color: themeColor }}
            >
              استعادة الإعدادات
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
