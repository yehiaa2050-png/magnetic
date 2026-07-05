import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Cloud, BarChart3, Magnet, Info, Palette, Box } from 'lucide-react';
import Simulator3D from './components/Simulator3D';
import ForceChart from './components/ForceChart';
import MagneticFieldOverlay from './components/MagneticFieldOverlay';
import AIAgentChat from './components/AIAgentChat';
import { 
    calculateMagneticForce, 
    calculateRequiredForce, 
    calculateEquilibriumDistance, 
    initPredictiveModel, 
    getOptimalDesignSuggestion,
    MAGNETIC_MATERIALS
} from './lib/physicsAndAI';
import { saveExperimentToCloud } from './lib/cloudStorage';
import { loadParams, saveParams } from './lib/cache';
import Tooltip from './components/Tooltip';
import GoogleLogin from './components/GoogleLogin';
import ExperimentHistory from './components/ExperimentHistory';

function App() {
  const [mass, setMass] = useState<number>(175);
  const [distance, setDistance] = useState<number>(30);
  const [material, setMaterial] = useState<string>('n52');
  const [shape, setShape] = useState<string>('box');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [themeColor, setThemeColor] = useState<string>('#06b6d4');
  
  // Initialize minimal local TF.js model and Load Cached Values
  useEffect(() => {
    initPredictiveModel();
    loadParams().then(params => {
      if (params) {
        if(params.mass !== undefined) setMass(params.mass);
        if(params.distance !== undefined) setDistance(params.distance);
        if(params.material !== undefined) setMaterial(params.material);
        if(params.shape !== undefined) setShape(params.shape);
      }
    });
  }, []);

  // Save values dynamically
  useEffect(() => {
    saveParams(mass, distance, material, shape);
  }, [mass, distance, material, shape]);

  const requiredForce = calculateRequiredForce(mass);
  const currentForce = calculateMagneticForce(distance, material);
  
  const status = useMemo<'balanced' | 'falling' | 'flying'>(() => {
    const tolerance = requiredForce * 0.05; 
    if (currentForce > requiredForce + tolerance) return 'flying';
    if (currentForce < requiredForce - tolerance) return 'falling';
    return 'balanced';
  }, [requiredForce, currentForce]);

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    setSaveMessage('جاري الحفظ في سحابة ركيزة (R2)...');
    try {
        await saveExperimentToCloud({
            timestamp: new Date().toISOString(),
            weightKg: mass,
            distanceMm: distance,
            calculatedForceN: currentForce,
            isEquilibrium: status === 'balanced'
        });
        setSaveMessage('تم حفظ التجربة بنجاح!');
        setTimeout(() => setSaveMessage(''), 3000);
    } catch(e) {
        setSaveMessage('فشل الحفظ. يرجى التحقق من الاتصال.');
        setTimeout(() => setSaveMessage(''), 3000);
    } finally {
        setIsSaving(false);
    }
  };
  
  // Predict quick balance
  const handleAutoBalance = () => {
     const eqDistance = calculateEquilibriumDistance(mass, material);
     setDistance(eqDistance);
  };

  const handleColorChange = (hex: string) => {
      setThemeColor(hex);
      document.documentElement.style.setProperty('--theme-color', hex);
      const r = parseInt(hex.slice(1, 3), 16) || 6;
      const g = parseInt(hex.slice(3, 5), 16) || 182;
      const b = parseInt(hex.slice(5, 7), 16) || 212;
      document.documentElement.style.setProperty('--theme-color-dim', `rgba(${r},${g},${b},0.2)`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e2e8f0] p-4 md:p-8 font-sans selection:bg-white/10 grid-bg">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mb-8 border-b border-white/10 pb-4 glass-panel p-4 rounded-xl z-20 relative gap-4">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center magnetic-glow" style={{ backgroundColor: themeColor }}>
                <Magnet className="w-6 h-6 text-[#050505] rotate-180" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-white underline underline-offset-4" style={{ textDecorationColor: themeColor }}>
                مختبر التنافر المغناطيسي - ZeroOne OS
                </h1>
                <p className="text-[10px] uppercase tracking-widest mono" style={{ color: themeColor }}>Advanced Physics Simulation v5.0.0</p>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <Tooltip text="تخصيص اللون المميز والتوهج المغناطيسي لكامل واجهة المعمل.">
                <div className="flex items-center gap-3 px-4 py-2 border border-white/5 shadow-inner rounded-full bg-black/40">
                    <Palette className="w-4 h-4 text-white/50" />
                    <span className="text-[10px] uppercase text-white/70 mono">Theme Matrix</span>
                    <input 
                        type="color" 
                        value={themeColor} 
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-5 h-5 p-0 border-0 rounded cursor-pointer bg-transparent"
                    />
                </div>
            </Tooltip>
            <GoogleLogin themeColor={themeColor} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Right Panel (Dashboard & Controls) */}
        <section className="col-span-1 lg:col-span-4 space-y-6 flex flex-col order-2 lg:order-1">
            
            {/* Status Card */}
            <div 
                className="p-5 rounded-2xl glass-panel shadow-xl transition-colors duration-500 border-l-4" 
                style={{ borderLeftColor: status === 'balanced' ? '#10b981' : status === 'flying' ? '#f43f5e' : themeColor }}
            >
                <h2 className="text-[10px] text-white/40 uppercase mb-1 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    حالة التوازن (Equilibrium)
                </h2>
                <div className="text-lg font-bold">
                    {status === 'balanced' && <span className="text-emerald-400">✅ متوازن (طبيعي)</span>}
                    {status === 'flying' && <span className="text-rose-400">🚀 قوة زائدة (متطاير)</span>}
                    {status === 'falling' && <span className="text-slate-300">⬇️ القوة غير كافية (ساقط)</span>}
                </div>
            </div>

            {/* Controls Card */}
            <div className="glass-panel border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
                
                {/* Visual Settings: Shape & Material */}
                <div className="grid grid-cols-2 gap-4 pb-2 border-b border-white/5">
                    <div>
                        <label className="block text-[10px] uppercase text-white/50 mb-2">مادة المغناطيس</label>
                        <select 
                            value={material} 
                            onChange={(e) => setMaterial(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                            style={{ outlineColor: themeColor }}
                        >
                            {Object.entries(MAGNETIC_MATERIALS).map(([key, m]) => (
                                <option key={key} value={key}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase text-white/50 mb-2">شكل الجسم</label>
                        <select 
                            value={shape} 
                            onChange={(e) => setShape(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                            style={{ outlineColor: themeColor }}
                        >
                            <option value="box">مكعب (معدني)</option>
                            <option value="sphere">كرة (فولاذية)</option>
                            <option value="torus">حلقة (رنين)</option>
                            <option value="rail">قضيب (سكة حديدية)</option>
                        </select>
                    </div>
                </div>

                <div>
                   <label className="flex justify-between mb-2 text-xs font-semibold uppercase tracking-wider">
                       <Tooltip text="يحدد كتلة الجسم المراد رفعه، وكلما زاد الوزن تطلب قوة مغناطيسية أكبر لتحقيق التوازن.">
                            <span style={{ color: themeColor }} className="underline underline-offset-4 decoration-white/20">الوزن المستهدف (كجم)</span>
                       </Tooltip>
                       <span className="mono" style={{ color: themeColor }}>{mass.toFixed(1)}</span>
                   </label>
                   <input 
                      type="range" 
                      min="10" max="500" step="5"
                      value={mass}
                      onChange={(e) => setMass(Number(e.target.value))}
                      className="w-full bg-white/10 h-1 rounded-full cursor-pointer transition-all"
                      style={{ accentColor: themeColor }}
                   />
                </div>

                <div>
                   <label className="flex justify-between mb-2 text-xs font-semibold uppercase tracking-wider">
                       <Tooltip text="المسافة بين النظام المغناطيسي والجسم المرفوع، تؤثر بصفة عكسية حادة على شدة القوة.">
                            <span style={{ color: themeColor }} className="underline underline-offset-4 decoration-white/20">المسافة (ملم)</span>
                       </Tooltip>
                       <span className="mono" style={{ color: themeColor }}>{distance.toFixed(1)}</span>
                   </label>
                   <input 
                      type="range" 
                      min="10" max="150" step="1"
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      className="w-full bg-white/10 h-1 rounded-full cursor-pointer transition-all"
                      style={{ accentColor: themeColor }}
                   />
                </div>
                
                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-sm">
                    <span className="text-[10px] text-white/40 uppercase mb-1">القوة المغناطيسية المحسوبة</span>
                    <span className="font-mono text-xl font-bold text-white">
                        {currentForce.toFixed(0)} <span className="text-xs font-normal" style={{ color: themeColor }}>نيوتن</span>
                    </span>
                </div>
                
                <button 
                    onClick={handleAutoBalance}
                    className="w-full py-2 bg-black/40 hover:bg-black/60 text-emerald-400 rounded transition-colors text-xs font-mono tracking-widest uppercase border border-white/5"
                >
                    ⚖️ Auto-Balance
                </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3">
                <Tooltip text="يسجل كافة البيانات الفيزيائية المتوفرة ومعطيات التوازن في قاعدة بيانات سحابية لحظية.">
                    <button 
                        onClick={handleSaveToCloud}
                        disabled={isSaving}
                        className="w-full py-3 border border-white/10 hover:border-white/30 text-white/80 text-sm rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50 bg-black/20"
                    >
                        <Cloud className="w-5 h-5" />
                        {isSaving ? 'جاري الحفظ...' : 'حفظ التجربة في السحابة'}
                    </button>
                </Tooltip>

                {saveMessage && (
                    <div className="text-center text-sm font-mono text-cyan-400 mt-1">
                        {saveMessage}
                    </div>
                )}
            </div>

            {/* Experiment History */}
            <div className="mt-4">
                <ExperimentHistory 
                    themeColor={themeColor} 
                    onRestore={(data) => {
                        if (data.weightKg) setMass(data.weightKg);
                        if (data.distanceMm) setDistance(data.distanceMm);
                        if (data.material) setMaterial(data.material);
                        if (data.shape) setShape(data.shape);
                    }} 
                />
            </div>
            
            {/* AI Agent Chat Box */}
            <div className="mt-4">
               <AIAgentChat 
                  themeColor={themeColor} 
                  state={{
                     massKg: mass,
                     distanceMm: distance,
                     material: MAGNETIC_MATERIALS[material]?.name || material,
                     shape,
                     forceN: currentForce,
                     requiredForceN: requiredForce
                  }} 
               />
            </div>
        </section>

        {/* Left Panel (3D & Visuals) */}
        <section className="col-span-1 lg:col-span-8 flex flex-col gap-8 order-1 lg:order-2">
            
            <div className="flex-1 glass-panel rounded-2xl shadow-xl overflow-hidden relative group min-h-[400px]">
                <Simulator3D 
                    massKg={mass} 
                    distanceMm={distance} 
                    setDistanceMm={setDistance} 
                    status={status}
                    themeColor={themeColor}
                    shape={shape}
                />
                <MagneticFieldOverlay distanceMm={distance} forceN={currentForce} themeColor={themeColor} />
            </div>
            
            <div className="mt-auto glass-panel p-6 rounded-2xl">
               <header className="flex items-center justify-between mb-6">
                 <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    تحليل المنحنى الفيزيائي
                 </h3>
                 <span className="text-[10px] mono" style={{ color: themeColor }}>Real-time</span>
               </header>
               <ForceChart massKg={mass} currentDistanceMm={distance} themeColor={themeColor} />
            </div>
        </section>
        
      </main>
    </div>
  );
}

export default App;
