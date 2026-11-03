import React, { useState, useEffect, useRef } from 'react';

type DefectStatus = 'Offen' | 'In Arbeit' | 'Erledigt';
type ViewMode = 'vermieter' | 'mieter';
type Theme = 'light' | 'dark';

interface Property {
  id: number;
  street: string;
  city: string;
  units: number;
  occupied: number;
  statusLabel: string;
  statusTone: 'ok' | 'warn' | 'action';
}

interface Defect {
  id: number;
  title: string;
  wohnung: string;
  time: string;
  status: DefectStatus;
  desc: string;
  hasImage: boolean;
  propertyId: number;
  isNew?: boolean;
}

const PROPERTIES: Property[] = [
  { id: 1, street: 'Dalhauser Str. 12', city: '37688 Beverungen', units: 4, occupied: 4, statusLabel: 'Alles ok', statusTone: 'ok' },
  { id: 2, street: 'Kolpingstr. 8', city: '37688 Beverungen', units: 6, occupied: 5, statusLabel: '1 offener Mangel', statusTone: 'warn' },
  { id: 3, street: 'Weserblick 4', city: '37688 Beverungen', units: 3, occupied: 3, statusLabel: 'Abrechnung fällig', statusTone: 'action' },
];

const INITIAL_DEFECTS: Defect[] = [
  { id: 1, title: 'Wasserhahn tropft', wohnung: 'Whg 3 • Dalhauser Str. 12', time: 'Vor 2h', status: 'Offen', desc: 'Tropft seit gestern Abend ununterbrochen, Eimer steht drunter. Video vorhanden.', hasImage: true, propertyId: 1 },
  { id: 2, title: 'Heizung klackert', wohnung: 'Whg 1 • Kolpingstr. 8', time: 'Vor 5h', status: 'In Arbeit', desc: 'Beim Aufheizen lautes Klackern, vermutlich Luft im System.', hasImage: false, propertyId: 2 },
  { id: 3, title: 'Briefkasten klemmt', wohnung: 'Whg 2 • Weserblick 4', time: 'Gestern', status: 'Erledigt', desc: 'Schloss verklemmt, Mieter kommt nicht an Post. WD-40 probiert.', hasImage: true, propertyId: 3 },
];

export default function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('vermieter');
  const [defects, setDefects] = useState<Defect[]>(INITIAL_DEFECTS);
  const [activeProp, setActiveProp] = useState<number | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: '', wohnung: 'Dalhauser Str. 12 • Whg 3', desc: '', hasPhoto: false });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('wonio-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wonio-theme', theme);
  }, [theme, mounted]);

  const filteredDefects = activeProp ? defects.filter(d => d.propertyId === activeProp) : defects;

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const cycleStatus = (id: number) => {
    setAnimatingId(id);
    setTimeout(() => {
      setDefects(prev => prev.map(d => {
        if (d.id !== id) return d;
        const next: DefectStatus = d.status === 'Offen' ? 'In Arbeit' : d.status === 'In Arbeit' ? 'Erledigt' : 'Offen';
        return { ...d, status: next };
      }));
      setAnimatingId(null);
      setShowToast('Status aktualisiert');
      setTimeout(() => setShowToast(null), 2200);
    }, 180);
  };

  const handleSubmitMangel = () => {
    if (!form.title.trim() || !form.desc.trim()) {
      setFormError('Bitte Titel und Beschreibung ausfüllen.');
      return;
    }
    const propMatch = PROPERTIES.find(p => form.wohnung.includes(p.street)) || PROPERTIES[0];
    const newDefect: Defect = {
      id: Date.now(),
      title: form.title,
      wohnung: form.wohnung,
      time: 'Gerade eben',
      status: 'Offen',
      desc: form.desc,
      hasImage: form.hasPhoto,
      propertyId: propMatch.id,
      isNew: true,
    };
    setDefects([newDefect, ...defects]);
    setForm({ title: '', wohnung: 'Dalhauser Str. 12 • Whg 3', desc: '', hasPhoto: false });
    setFormError('');
    setViewMode('vermieter');
    setShowToast('Mangel live im Dashboard • Vermieter benachrichtigt');
    setTimeout(() => setShowToast(null), 3500);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] selection:bg-[var(--accent)] selection:text-white">
      <div className="min-h-screen w-full" style={{ paddingTop: 'var(--safe-area-inset-top)', boxSizing: 'border-box' }}>
        {/* APPLE HEADER */}
        <header className="sticky z-40 border-b border-[var(--border-light)] frosted bg-[var(--header-bg)]" style={{ top: 'var(--safe-area-inset-top)' }}>
          <div className="mx-auto max-w-[980px] px-6 md:px-6 h-[52px] flex items-center justify-between">
            {/* Left: WONIO wordmark */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <span className="text-[22px] font-[700] tracking-[-0.03em] leading-none text-[var(--text-primary)]">WONIO</span>
                <span className="hidden md:inline-flex ml-2 text-[10px] font-[600] tracking-[0.06em] text-[var(--text-secondary)] border border-[var(--border)] rounded-full px-2 py-0.5">DIE VERMIETER APP</span>
              </div>
              <nav className="hidden md:flex items-center gap-7 ml-6">
                {['Immobilien','Mängel','Abrechnung'].map(item => (
                  <button key={item} onClick={() => { document.getElementById('dashboard')?.scrollIntoView({behavior:'smooth'}); setShowToast(`${item}`); setTimeout(()=>setShowToast(null),1800); }} className="text-[12px] font-[400] tracking-[-0.01em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    {item}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle Pill - Apple style */}
              <button
                aria-label="Toggle dark mode"
                onClick={toggleTheme}
                className="relative w-[64px] h-[32px] rounded-full bg-[var(--toggle-bg)] border border-[var(--border-light)] p-1 flex items-center transition-all duration-500 apple-spring"
                style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)' }}
              >
                <div className={`absolute w-[26px] h-[26px] rounded-full bg-[var(--card)] shadow-[0_1px_4px_rgba(0,0,0,0.15),0_0_0_0.5px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all duration-500 apple-spring ${theme === 'dark' ? 'translate-x-[32px]' : 'translate-x-0'}`}>
                  {theme === 'light' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#FFCC02]">
                      <circle cx="12" cy="12" r="4" fill="currentColor" />
                      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M12 2v1.5M12 20.5V22M2 12h1.5M20.5 12H22M4.9 4.9l1.1 1.1M18 18l1.1 1.1M4.9 19.1l1.1-1.1M18 6l1.1-1.1"/>
                      </g>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#8E8E93]">
                      <path d="M14.5 3.5A6.5 6.5 0 1 0 20 11a6.5 6.5 0 0 1-5.5-7.5Z" fill="currentColor" />
                    </svg>
                  )}
                </div>
                <div className="w-full flex justify-between px-1.5 text-[10px] opacity-40">
                  <span>☀</span><span>☾</span>
                </div>
              </button>

              <div className="hidden md:flex w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-light)] items-center justify-center text-[11px] font-[600] text-[var(--text-secondary)]">JD</div>
            </div>
          </div>
        </header>

        {/* HERO - Apple.com style */}
        <section className="mx-auto max-w-[980px] px-6 md:px-6 pt-[48px] md:pt-[96px] pb-[48px] text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/10 text-[11px] font-[600] tracking-[0.02em] text-[var(--accent)] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
            NEU • FÜR 3–20 WOHNUNGEN IN BEVERUNGEN
          </div>

          <h1 className="text-[40px] md:text-[64px] font-[700] leading-[0.95] tracking-[-0.04em] text-[var(--text-primary)] max-w-[800px] mx-auto">
            WONIO.<br/>
            <span className="font-[700]">Vermietung.</span><br/>
            <span className="bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent font-[700]">Endlich klar.</span>
          </h1>

          <p className="mt-6 md:mt-8 text-[19px] md:text-[21px] leading-[1.38] tracking-[-0.02em] text-[var(--text-secondary)] font-[400] max-w-[640px] mx-auto">
            Mängel per Foto. Nebenkosten in 1 Klick.<br className="hidden md:block"/>
            Mieter happy. Keine Zettelwirtschaft mehr.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              onClick={() => {
                document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                setShowToast('Dashboard geöffnet • Willkommen bei WONIO');
                setTimeout(()=>setShowToast(null),2500);
              }}
              className="h-[44px] md:h-[52px] px-6 md:px-8 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-[500] text-[17px] tracking-[-0.02em] transition-all duration-300 apple-spring hover:scale-[1.02] active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            >
              WONIO testen
            </button>
            <span className="text-[12px] font-[400] text-[var(--text-tertiary)] tracking-[-0.01em]">29€/Monat • 1. Monat gratis • Keine Kreditkarte</span>
          </div>

          {/* Segmented Control - Apple style */}
          <div className="mt-14 md:mt-20 mx-auto max-w-[320px]">
            <div className="flex items-center justify-center gap-1 p-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-light)]">
              <button
                onClick={() => setViewMode('vermieter')}
                className={`flex-1 h-[36px] rounded-full text-[13px] font-[500] tracking-[-0.01em] transition-all duration-300 apple-spring ${viewMode==='vermieter' ? 'bg-[var(--card)] text-[var(--text-primary)] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[var(--border-light)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Vermieter
              </button>
              <button
                onClick={() => setViewMode('mieter')}
                className={`flex-1 h-[36px] rounded-full text-[13px] font-[500] tracking-[-0.01em] transition-all duration-300 apple-spring ${viewMode==='mieter' ? 'bg-[var(--card)] text-[var(--text-primary)] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[var(--border-light)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Mieter-Sicht
              </button>
            </div>
          </div>
        </section>

        {/* DASHBOARD PREVIEW - Apple cards */}
        <section id="dashboard" className="bg-[var(--bg-secondary)] border-y border-[var(--border-light)]">
          <div className="mx-auto max-w-[1120px] px-6 md:px-8 py-10 md:py-16">
            {/* Dashboard header like Apple */}
            <div className="flex items-end justify-between mb-10 px-2">
              <div>
                <h2 className="text-[28px] md:text-[32px] font-[700] tracking-[-0.03em] text-[var(--text-primary)] leading-none">Übersicht</h2>
                <p className="text-[14px] text-[var(--text-secondary)] mt-2 font-[400]">13 Wohnungen • 12 vermietet • Beverungen • Live</p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse"></span>
                <span className="text-[11px] font-[600] tracking-[0.06em] text-[var(--text-secondary)]">LIVE</span>
              </div>
            </div>

            <div className="grid md:grid-cols-[300px_minmax(0,1fr)_320px] gap-6 md:gap-7">
              {/* LEFT - Immobilien - Apple cards */}
              <div className="space-y-4">
                <div className="rounded-[20px] bg-[var(--card)] border border-[var(--border-light)] p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[13px] font-[600] tracking-[-0.01em] text-[var(--text-primary)]">Immobilien</h3>
                    <span className="text-[11px] text-[var(--text-tertiary)]">{PROPERTIES.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {PROPERTIES.map(prop => (
                      <button
                        key={prop.id}
                        onClick={() => setActiveProp(activeProp===prop.id ? null : prop.id)}
                        className={`group w-full text-left rounded-[14px] border p-3.5 transition-all duration-300 apple-spring text-left ${activeProp===prop.id ? 'bg-[var(--text-primary)] text-[var(--bg)] border-[var(--text-primary)] shadow-[var(--shadow-soft)]' : 'bg-[var(--bg)] hover:bg-[var(--card-hover)] border-[var(--border-light)] hover:border-[var(--border)]'}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className={`text-[13px] font-[600] tracking-[-0.01em] leading-[1.2] ${activeProp===prop.id ? 'text-[var(--bg)]' : 'text-[var(--text-primary)]'}`}>{prop.street}</div>
                          <div className={`shrink-0 w-2 h-2 rounded-full mt-1 ${prop.statusTone==='ok' ? 'bg-[#30D158]' : prop.statusTone==='warn' ? 'bg-[#FF9F0A]' : 'bg-[#FF3B30]'}`}></div>
                        </div>
                        <div className={`text-[11px] mt-1 ${activeProp===prop.id ? 'text-white/60' : 'text-[var(--text-secondary)]'}`}>{prop.city}</div>
                        <div className="mt-3 flex gap-1.5">
                          <span className={`text-[10px] font-[500] px-2 py-1 rounded-full ${activeProp===prop.id ? 'bg-white/15 text-white/80' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}>{prop.occupied}/{prop.units} vermietet</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-light)] p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--text-primary)] text-[var(--bg)] grid place-items-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div>
                      <div className="text-[11px] font-[600] tracking-[0.02em] text-[var(--text-tertiary)]">NÄCHSTE ABRECHNUNG</div>
                      <div className="text-[12px] font-[500] text-[var(--text-primary)]">Weserblick 4 • in 3 Tagen</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] bg-[var(--card)] border border-[var(--border-light)] p-5 shadow-[var(--shadow-card)]">
                  <h3 className="text-[13px] font-[600] tracking-[-0.01em] text-[var(--text-primary)] mb-4">Mieter</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'M. Schneider', whg: 'Whg 3', dot: '#30D158' },
                      { name: 'K. Weber', whg: 'Whg 1 • Mangel', dot: '#FF3B30' },
                      { name: 'Fam. Yildiz', whg: 'Whg 2', dot: '#30D158' },
                    ].map(m => (
                      <div key={m.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-light)] grid place-items-center text-[11px] font-[600] text-[var(--text-secondary)]">{m.name[0]}</div>
                          <div>
                            <div className="text-[12px] font-[500] leading-none text-[var(--text-primary)]">{m.name}</div>
                            <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{m.whg}</div>
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full" style={{ background: m.dot }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CENTER - Mängel Feed */}
              <div className="space-y-4">
                {/* Mieter Form - Apple Sheet */}
                {viewMode === 'mieter' && (
                  <div className="rounded-[20px] bg-[var(--card)] border border-[var(--border-light)] p-6 shadow-[var(--shadow-card)] animate-[slideIn_0.5s_cubic-bezier(0.28,0.11,0.32,1)]">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white grid place-items-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
                      </div>
                      <h3 className="text-[15px] font-[600] tracking-[-0.02em] text-[var(--text-primary)]">Mangel melden</h3>
                      <span className="ml-auto text-[10px] font-[600] px-2 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-light)]">MIETER</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-[600] tracking-[0.04em] text-[var(--text-secondary)]">WOHNUNG</label>
                        <select value={form.wohnung} onChange={e=>setForm({...form, wohnung:e.target.value})} className="mt-2 w-full h-[44px] rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-light)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-soft)] transition-all">
                          <option>Dalhauser Str. 12 • Whg 3</option>
                          <option>Kolpingstr. 8 • Whg 1</option>
                          <option>Weserblick 4 • Whg 2</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-[600] tracking-[0.04em] text-[var(--text-secondary)]">TITEL</label>
                        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="z.B. Wasserhahn tropft" className="mt-2 w-full h-[44px] rounded-[12px] bg-[var(--bg)] border border-[var(--border-light)] px-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-soft)] transition-all" />
                      </div>
                      <div>
                        <label className="text-[11px] font-[600] tracking-[0.04em] text-[var(--text-secondary)]">BESCHREIBUNG</label>
                        <textarea value={form.desc} onChange={e=>setForm({...form, desc:e.target.value})} placeholder="Was ist kaputt? Seit wann?..." className="mt-2 w-full min-h-[88px] rounded-[12px] bg-[var(--bg)] border border-[var(--border-light)] p-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-soft)] resize-none transition-all"></textarea>
                      </div>
                      <button onClick={() => fileInputRef.current?.click()} className={`w-full h-[44px] rounded-[12px] border border-dashed flex items-center justify-center gap-2 text-[12px] font-[500] transition-all ${form.hasPhoto ? 'border-[#30D158] bg-[#30D158]/10 text-[#30D158]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                        {form.hasPhoto ? 'Foto hinzugefügt' : 'Foto hinzufügen'}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={() => setForm({...form, hasPhoto:true})} />
                      {formError && <div className="text-[11px] font-[500] text-[#FF3B30]">{formError}</div>}
                      <button onClick={handleSubmitMangel} className="w-full h-[44px] rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-[500] text-[13px] transition-all active:scale-[0.98]">Absenden</button>
                      <div className="text-[10px] text-[var(--text-tertiary)] text-center font-[400]">Nur lokale Vorschau – kein Versand</div>
                    </div>
                  </div>
                )}

                <div className="rounded-[20px] bg-[var(--card)] border border-[var(--border-light)] p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-[600] tracking-[-0.02em] text-[var(--text-primary)]">Mängel</h3>
                    <div className="flex items-center gap-2">
                      {activeProp && <button onClick={()=>setActiveProp(null)} className="text-[11px] font-[500] px-2.5 py-1 rounded-full bg-[var(--text-primary)] text-[var(--bg)]">Filter ×</button>}
                      <span className="text-[11px] font-[500] px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-secondary)]">{filteredDefects.length}</span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {filteredDefects.map(defect => (
                      <div key={defect.id} className={`group relative rounded-[16px] border p-4 transition-all duration-300 apple-spring cursor-pointer hover:shadow-[var(--shadow-soft)] ${defect.isNew ? 'border-[#30D158]/30 bg-[#30D158]/[0.06]' : 'border-[var(--border-light)] bg-[var(--bg)] hover:bg-[var(--card-hover)]'} ${animatingId===defect.id ? 'scale-[0.98] opacity-60' : 'scale-100'}`} onClick={() => cycleStatus(defect.id)}>
                        <div className="flex gap-3.5">
                          <div className={`shrink-0 w-[48px] h-[48px] rounded-[12px] grid place-items-center border ${defect.hasImage ? 'bg-[var(--bg-secondary)] border-[var(--border-light)]' : 'bg-transparent border-dashed border-[var(--border)]'}`}>
                            {defect.hasImage ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-secondary)]"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.5"/><path d="M21 15l-3.5-3.5a2 2 0 0 0-2.8 0L3 21"/></svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-[var(--text-tertiary)]"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/></svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-[13px] font-[600] tracking-[-0.01em] text-[var(--text-primary)] leading-[1.2] truncate pr-2">{defect.title}</div>
                              <div className={`shrink-0 flex items-center gap-1 text-[10px] font-[600] tracking-[0.02em] px-2 py-1 rounded-full border transition-all
                                ${defect.status==='Offen' ? 'bg-[#FF3B30]/10 border-[#FF3B30]/20 text-[#FF3B30]' : ''}
                                ${defect.status==='In Arbeit' ? 'bg-[#FF9F0A]/10 border-[#FF9F0A]/20 text-[#FF9F0A]' : ''}
                                ${defect.status==='Erledigt' ? 'bg-[#30D158]/10 border-[#30D158]/20 text-[#30D158]' : ''}
                              `}>
                                {defect.status==='Erledigt' && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-[check_0.4s_cubic-bezier(0.28,0.11,0.32,1)]"><path d="M5 12l5 5L20 7"/></svg>
                                )}
                                {defect.status.toUpperCase()}
                              </div>
                            </div>
                            <div className="text-[11px] text-[var(--text-tertiary)] mt-1 font-[400]">{defect.wohnung} • {defect.time}</div>
                            <div className="text-[12px] leading-[1.45] mt-2 text-[var(--text-secondary)] font-[400] line-clamp-2">{defect.desc}</div>
                            {defect.isNew && <div className="mt-2 inline-flex text-[10px] font-[600] px-2 py-0.5 rounded-full bg-[#30D158] text-white">NEU</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setViewMode('mieter')} className="w-full h-[44px] rounded-[12px] border border-dashed border-[var(--border)] text-[12px] font-[500] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                      + Mangel simulieren
                    </button>
                  </div>
                </div>

                <div className="rounded-[20px] bg-[var(--text-primary)] text-[var(--bg)] p-5 flex items-center justify-between shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--bg)] text-[var(--text-primary)] grid place-items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                    <div>
                      <div className="text-[13px] font-[600] tracking-[-0.01em]">Nebenkosten 2023/24</div>
                      <div className="text-[11px] opacity-60 font-[400]">Weserblick 4 • Bereit zum Versand</div>
                    </div>
                  </div>
                  <button onClick={() => setShowToast('Abrechnung erstellt • PDF Vorschau')} className="h-[32px] px-4 rounded-full bg-[var(--bg)] text-[var(--text-primary)] text-[12px] font-[600] hover:opacity-90 transition-opacity">Erstellen</button>
                </div>
              </div>

              {/* RIGHT */}
              <div className="space-y-4">
                <div className="rounded-[20px] bg-[var(--card)] border border-[var(--border-light)] p-5 shadow-[var(--shadow-card)]">
                  <h3 className="text-[13px] font-[600] tracking-[-0.01em] text-[var(--text-primary)] mb-4">Aktionen</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button onClick={() => setViewMode('mieter')} className="rounded-[14px] bg-[var(--text-primary)] text-[var(--bg)] p-3.5 text-left hover:opacity-90 transition-opacity group">
                      <div className="w-7 h-7 rounded-full bg-white/15 grid place-items-center mb-2.5 group-hover:scale-110 transition-transform apple-spring">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </div>
                      <div className="text-[12px] font-[600] leading-[1.2]">Mängel<br/>melden</div>
                      <div className="text-[10px] opacity-60 mt-1">Mieter</div>
                    </button>
                    <button onClick={() => setShowToast('Nebenkostenassistent geöffnet')} className="rounded-[14px] bg-[var(--bg-secondary)] border border-[var(--border-light)] p-3.5 text-left hover:bg-[var(--card-hover)] transition-colors">
                      <div className="w-7 h-7 rounded-full bg-[var(--bg)] border border-[var(--border-light)] grid place-items-center mb-2.5">€</div>
                      <div className="text-[12px] font-[600] leading-[1.2] text-[var(--text-primary)]">Nebenkosten</div>
                      <div className="text-[10px] text-[var(--text-tertiary)] mt-1">1 Klick</div>
                    </button>
                    <button onClick={() => setShowToast('Einladungslink kopiert')} className="rounded-[14px] bg-[var(--bg-secondary)] border border-[var(--border-light)] p-3.5 text-left hover:bg-[var(--card-hover)] transition-colors">
                      <div className="w-7 h-7 rounded-full bg-[var(--bg)] border border-[var(--border-light)] grid place-items-center mb-2.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </div>
                      <div className="text-[12px] font-[600] leading-[1.2] text-[var(--text-primary)]">Mieter<br/>einladen</div>
                      <div className="text-[10px] text-[var(--text-tertiary)] mt-1">Link</div>
                    </button>
                    <button onClick={() => setShowToast('IBAN verbunden')} className="rounded-[14px] bg-[var(--accent-soft)] border border-[var(--accent)]/10 p-3.5 text-left hover:bg-[var(--accent)]/10 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white grid place-items-center mb-2.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      </div>
                      <div className="text-[12px] font-[600] leading-[1.2] text-[var(--text-primary)]">Geld<br/>prüfen</div>
                      <div className="text-[10px] text-[var(--text-tertiary)] mt-1">IBAN</div>
                    </button>
                  </div>
                </div>

                {/* Pricing - Apple style */}
                <div className="rounded-[20px] bg-[var(--card)] border border-[var(--border-light)] p-6 shadow-[var(--shadow-card)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[11px] font-[700] tracking-[0.08em] text-[var(--text-tertiary)]">WONIO PRO</div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-[36px] font-[700] tracking-[-0.03em] leading-none text-[var(--text-primary)]">29€</span>
                        <span className="text-[13px] font-[400] text-[var(--text-secondary)]">/ Monat</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-[600] px-2.5 py-1 rounded-full bg-[var(--text-primary)] text-[var(--bg)]">1. MONAT GRATIS</div>
                  </div>
                  <div className="mt-6 space-y-2.5 text-[12px] leading-[1.4] font-[400] text-[var(--text-secondary)]">
                    <div className="flex gap-2"><span className="text-[var(--accent)]">✓</span> Bis 20 Wohnungen, alles drin</div>
                    <div className="flex gap-2"><span className="text-[var(--accent)]">✓</span> Miete direkt auf deine IBAN</div>
                    <div className="flex gap-2"><span className="text-[var(--accent)]">✓</span> Nebenkosten in 1 Klick</div>
                    <div className="flex gap-2"><span className="text-[var(--accent)]">✓</span> Mieter-App inklusive</div>
                  </div>
                  <button onClick={() => setShowToast('Willkommen bei WONIO')} className="mt-6 w-full h-[44px] rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-[500] text-[13px] transition-all active:scale-[0.98]">WONIO testen</button>
                  <div className="mt-3 text-[10px] text-center text-[var(--text-tertiary)] font-[400]">Kein Setup • Monatlich kündbar • Hosting in DE</div>
                </div>

                <div className="px-2 text-[10px] leading-[1.5] text-[var(--text-tertiary)] text-center font-[400]">
                  WONIO • 37688 Beverungen<br/>
                  Vermietung endlich klar. Apple Design Edition.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer strip - Apple style */}
        <section className="mx-auto max-w-[980px] px-6 py-12">
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[11px] font-[400] text-[var(--text-secondary)]">Foto-Mängel in Echtzeit</span>
            <span className="px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[11px] font-[400] text-[var(--text-secondary)]">Nebenkosten in 1 Klick</span>
            <span className="px-3.5 py-1.5 rounded-full bg-[var(--accent)] text-white text-[11px] font-[500]">Geld direkt auf IBAN</span>
          </div>
          <div className="mt-10 flex flex-col items-center gap-3 text-[11px] text-[var(--text-tertiary)]">
            <div className="flex gap-5">
              <button className="hover:text-[var(--text-secondary)] transition-colors">Datenschutz</button>
              <button className="hover:text-[var(--text-secondary)] transition-colors">Impressum</button>
              <button className="hover:text-[var(--text-secondary)] transition-colors">Support</button>
            </div>
            <div>© 2025 WONIO • Designed in Beverungen • Apple Design Language</div>
          </div>
        </section>

        {/* Toast - Apple style */}
        {showToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[var(--text-primary)] text-[var(--bg)] text-[12px] font-[500] shadow-[0_8px_24px_rgba(0,0,0,0.18)] border border-white/10 flex items-center gap-2.5 animate-[slideUp_0.4s_cubic-bezier(0.28,0.11,0.32,1)]">
            <span className="w-5 h-5 rounded-full bg-white/15 grid place-items-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
            </span>
            {showToast}
          </div>
        )}

        <style>{`
          @keyframes slideUp { from { transform: translate(-50%, 16px); opacity:0 } to { transform: translate(-50%, 0); opacity:1 } }
          @keyframes slideIn { from { transform: translateY(12px); opacity:0 } to { transform: translateY(0); opacity:1 } }
          @keyframes check { 0% { stroke-dasharray: 0 20; } 100% { stroke-dasharray: 20 0; } }
        `}</style>
      </div>
    </div>
  );
}
