import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Droplet,
  AlertTriangle,
  TrendingUp,
  Database,
  Download,
  Plus,
  MapPin,
  X,
  Sparkles,
  CheckCircle,
  FileText,
  Building,
  Activity,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

import { INITIAL_FACTORIES, INITIAL_COMPLAINTS } from './data';
import { Factory, FactoryStatus, Complaint, ComplaintType } from './types';
import Map from './components/Map';
import TrendChart from './components/TrendChart';
import ReportForm from './components/ReportForm';
import DebrecenDashboard from './components/DebrecenDashboard';
import {
  getComplaints,
  insertComplaint,
  subscribeToComplaints,
  isSupabaseConfigured
} from './supabaseClient';

export default function App() {
  // State for raw data
  const [factories, setFactories] = useState<Factory[]>(INITIAL_FACTORIES);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);

  // Load complaints from Supabase on mount
  useEffect(() => {
    let active = true;
    async function fetchInitialData() {
      const data = await getComplaints();
      if (active) {
        setComplaints(data);
        
        // Dynamically update factories' complaint counts to match the real count from fetched database complaints
        setFactories((prevFactories) =>
          prevFactories.map((f) => {
            const count = data.filter((c) => c.factoryId === f.id).length;
            return {
              ...f,
              lakossagi_bejelentesek_szama: count || f.lakossagi_bejelentesek_szama,
            };
          })
        );
      }
    }
    fetchInitialData();
    return () => {
      active = false;
    };
  }, []);

  // Setup real-time Supabase subscription
  useEffect(() => {
    const unsubscribe = subscribeToComplaints((newC) => {
      setComplaints((prev) => {
        // Prevent duplicates (idempotency check)
        const isDuplicate = prev.some(
          (c) => c.id === newC.id || (c.factoryId === newC.factoryId && c.leiras === newC.leiras && c.datum === newC.datum)
        );
        if (isDuplicate) {
          return prev;
        }

        // Increment complaint count for the factory for remote inserts
        setFactories((prevFactories) =>
          prevFactories.map((f) => {
            if (f.id === newC.factoryId) {
              return {
                ...f,
                lakossagi_bejelentesek_szama: f.lakossagi_bejelentesek_szama + 1,
              };
            }
            return f;
          })
        );

        return [newC, ...prev];
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // UI state
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'dashboard' | 'reports'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<FactoryStatus[]>([
    'mukodik',
    'epulo',
    'tervezett',
  ]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedComplaintType, setSelectedComplaintType] = useState<string>('all');

  // Selected factory helper
  const selectedFactory = useMemo(() => {
    if (!selectedFactoryId) return null;
    return factories.find((f) => f.id === selectedFactoryId) || null;
  }, [selectedFactoryId, factories]);

  // Handle new report submission with optimistic updates
  const handleNewComplaint = async (newC: Omit<Complaint, 'id' | 'hitelesitett'>) => {
    const tempId = `temp-c-${Date.now()}`;
    const optimisticComplaint: Complaint = {
      ...newC,
      id: tempId,
      hitelesitett: false,
    };

    // Update state immediately
    setComplaints((prev) => [optimisticComplaint, ...prev]);

    // Dynamically increment the count of reports for that factory
    setFactories((prev) =>
      prev.map((f) => {
        if (f.id === optimisticComplaint.factoryId) {
          return {
            ...f,
            lakossagi_bejelentesek_szama: f.lakossagi_bejelentesek_szama + 1,
          };
        }
        return f;
      })
    );

    // Persist to Supabase/localStorage
    const savedComplaint = await insertComplaint(newC);

    // Replace optimistic with real DB record
    setComplaints((prev) =>
      prev.map((c) => (c.id === tempId ? savedComplaint : c))
    );
  };

  // Export current raw metrics as JSON
  const handleExportMetrics = () => {
    const dataToExport = {
      export_datum: new Date().toISOString(),
      létesítmények_száma: factories.length,
      összes_bejelentés_száma: complaints.length,
      gyarak_adatai: factories,
      lakossagi_bejelentések: complaints,
      szamitas_metrika: {
        magyar_atlag_haztartas_eves_m3: 110,
        leiras: 'A vizigeny_becsult alapjan szamolt haztartasi egyenérték: (napi_fogyasztas * 365) / 110',
      },
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `akkugyar_vizhasznalat_metrikak_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle filter status
  const handleToggleStatusFilter = (status: FactoryStatus) => {
    if (statusFilters.includes(status)) {
      if (statusFilters.length > 1) {
        setStatusFilters(statusFilters.filter((s) => s !== status));
      }
    } else {
      setStatusFilters([...statusFilters, status]);
    }
  };

  // Filter factories based on search query and status filters
  const filteredFactories = useMemo(() => {
    return factories.filter((f) => {
      const matchesSearch =
        f.nev.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.helyszin.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilters.includes(f.statusz);
      return matchesSearch && matchesStatus;
    });
  }, [factories, searchQuery, statusFilters]);

  // Total visible metrics for selected context
  const totals = useMemo(() => {
    let officialSum = 0;
    let estimatedSum = 0;

    filteredFactories.forEach((f) => {
      officialSum += f.vizigeny_hivatalos || 0;
      estimatedSum += f.vizigeny_becsult || 0;
    });

    // Householder equivalents based on estimated/peak demand
    const estimatedHouseholds = Math.round((estimatedSum * 365) / 110);
    const officialHouseholds = Math.round((officialSum * 365) / 110);

    return {
      officialSum,
      estimatedSum,
      estimatedHouseholds,
      officialHouseholds,
    };
  }, [filteredFactories]);

  // Complaints related to selected factory
  const selectedFactoryComplaints = useMemo(() => {
    if (!selectedFactoryId) return [];
    return complaints.filter((c) => c.factoryId === selectedFactoryId);
  }, [selectedFactoryId, complaints]);

  // Filtered general complaints
  const filteredComplaints = useMemo(() => {
    if (selectedComplaintType === 'all') return complaints;
    return complaints.filter((c) => c.tipus === selectedComplaintType);
  }, [complaints, selectedComplaintType]);

  // Labels helper
  const statusLabel = (status: FactoryStatus) => {
    switch (status) {
      case 'mukodik':
        return { text: 'Működik', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' };
      case 'epulo':
        return { text: 'Épülő', color: 'bg-amber-50 text-amber-700 border-amber-200/60' };
      case 'tervezett':
        return { text: 'Tervezett', color: 'bg-rose-50 text-rose-700 border-rose-200/60' };
    }
  };

  const complaintTypeLabel = (type: ComplaintType) => {
    switch (type) {
      case 'vizhiany':
        return { text: 'Vízhiány', color: 'bg-amber-50 text-amber-700 border-amber-200/60' };
      case 'vizminoseg':
        return { text: 'Vízszennyezés', color: 'bg-cyan-50 text-cyan-700 border-cyan-200/60' };
      case 'zaj':
        return { text: 'Zajszennyezés', color: 'bg-purple-50 text-purple-700 border-purple-200/60' };
      case 'szag':
        return { text: 'Vegyi szag', color: 'bg-orange-50 text-orange-700 border-orange-200/60' };
      case 'egyeb':
        return { text: 'Egyéb panasz', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased overflow-x-hidden">
      {/* HEADER / NAVIGATION BAR */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[1000] px-4 py-3 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/10 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-blue-600">
                <Droplet className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase font-mono">
                  Akkugyárak Vízmérője
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono uppercase">
                  Civil Monitor
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500">
                A magyarországi akkumulátoripari létesítmények vízigényének és hatásainak független vizualizációja
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto">
            <button
              onClick={() => setShowReportModal(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Új Bejelentés</span>
            </button>
            <button
              onClick={handleExportMetrics}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Aktuális szűrt adatok és bejelentések letöltése JSON formátumban"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Adatok Exportálása</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* STATS TICKER BANNER */}
      <section className="bg-slate-100/60 border-b border-slate-200 py-2.5 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-slate-600 font-mono">
            
            {/* Total count */}
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Aktív Létesítmények:</span>
              <strong className="text-slate-800">{filteredFactories.length} db</strong>
            </div>

            {/* Total Official water */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
              <Droplet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hivatalos Vízigény:</span>
              <strong className="text-emerald-600">{totals.officialSum.toLocaleString('hu-HU')} m³/nap</strong>
            </div>

            {/* Total Estimated Water */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
              <Droplet className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              <span>Becsült Valós Csúcs:</span>
              <strong className="text-sky-600">{totals.estimatedSum.toLocaleString('hu-HU')} m³/nap</strong>
            </div>

            {/* Household comparison */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden lg:inline">Lakossági Egyenérték:</span>
              <strong className="text-amber-700 font-bold" title="Évi 110 m3-es háztartási átlaggal számolva">
                ~{totals.estimatedHouseholds.toLocaleString('hu-HU')} háztartás / év
              </strong>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Rendszer Aktív (2026)
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
        
        {/* LEFT PANEL: LIST, FILTERS, SELECTED DETAILS (5 Columns) */}
        <section className="lg:col-span-5 flex flex-col gap-4 min-h-0 lg:max-h-[calc(100vh-170px)]">
          
          {/* Search and Filters Card */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                Keresés és Szűrés
              </h3>
              {selectedFactoryId && (
                <button
                  onClick={() => setSelectedFactoryId(null)}
                  className="text-[10px] font-mono font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                >
                  Részletek bezárása
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Keress név vagy helyszín alapján..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Checkboxes */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {(['mukodik', 'epulo', 'tervezett'] as FactoryStatus[]).map((st) => {
                const label = statusLabel(st);
                const isActive = statusFilters.includes(st);
                return (
                  <button
                    key={st}
                    onClick={() => handleToggleStatusFilter(st)}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? `${label.color} border-slate-350 shadow-sm`
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-current animate-pulse' : 'bg-slate-300'}`}></span>
                    {label.text}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC VIEW: Factory List OR Selected Factory Detail */}
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[350px]">
            {selectedFactory ? (
              
              /* SELECTED FACTORY DETAIL CARD */
              <div className="flex flex-col h-full overflow-y-auto">
                
                {/* Back Link */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <button
                    onClick={() => setSelectedFactoryId(null)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
                    Vissza a listához
                  </button>
                  <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full border ${statusLabel(selectedFactory.statusz).color}`}>
                    {statusLabel(selectedFactory.statusz).text}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Name and Location */}
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedFactory.helyszin}, Magyarország
                    </span>
                    <h2 className="text-base font-black text-slate-950 tracking-tight leading-snug">
                      {selectedFactory.nev}
                    </h2>
                  </div>

                  {/* Comment */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {selectedFactory.megjegyzes}
                    </p>
                  </div>

                  {/* Water demand comparisons */}
                  <div className="space-y-3.5">
                    <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                      Vízhasználati Metrikák
                    </h4>

                    {/* Official demand */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Droplet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Hivatalos (KHT engedély):</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 text-sm">
                        {selectedFactory.vizigeny_hivatalos
                          ? `${selectedFactory.vizigeny_hivatalos.toLocaleString('hu-HU')} m³/nap`
                          : 'Nem közzétett'}
                      </span>
                    </div>

                    {/* Estimated actual/peak demand */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Droplet className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>Független becsült csúcs:</span>
                      </div>
                      <span className="font-mono font-bold text-sky-600 text-sm">
                        {selectedFactory.vizigeny_becsult
                          ? `${selectedFactory.vizigeny_becsult.toLocaleString('hu-HU')} m³/nap`
                          : 'Adat hiányzik'}
                      </span>
                    </div>

                    {/* Capacity */}
                    <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Activity className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>Tervezett kapacitás:</span>
                      </div>
                      <span className="font-mono font-bold text-slate-750">
                        {selectedFactory.kapacitas_gwh ? `${selectedFactory.kapacitas_gwh} GWh` : 'Nem ismert'}
                      </span>
                    </div>

                    {/* Source / Forrás */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Adatok forrása:</span>
                      <p className="text-[10px] text-slate-600 font-sans leading-normal">
                        {selectedFactory.forras}
                      </p>
                      {selectedFactory.forras_link && (
                        <a
                          href={selectedFactory.forras_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 mt-1 font-mono cursor-pointer font-bold"
                        >
                          Oknyomozó cikk / Hivatalos dokumentum
                          <ChevronRight className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Comparative visualization card */}
                  {selectedFactory.vizigeny_becsult && (
                    <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-xl space-y-2">
                      <h5 className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Miért aggasztó ez?
                      </h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        A gyár becsült napi vízfogyasztása (<strong>{selectedFactory.vizigeny_becsult.toLocaleString('hu-HU')} m³</strong>) nagyjából{' '}
                        <strong className="text-blue-800">
                          {Math.round((selectedFactory.vizigeny_becsult * 365) / 110).toLocaleString('hu-HU')} db
                        </strong>{' '}
                        magyar háztartás teljes éves vízfogyasztásával egyenértékű!
                      </p>
                    </div>
                  )}

                  {/* Direct Complaints Overlay List */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                      <span>Kapcsolódó panaszok ({selectedFactoryComplaints.length})</span>
                      <span className="text-[9px] lowercase text-slate-400">csak helyi észlelések</span>
                    </h4>
                    
                    {selectedFactoryComplaints.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic font-sans py-1">
                        Ehhez a gyárhoz még nem rögzítettek lakossági panaszt.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {selectedFactoryComplaints.map((c) => (
                          <div key={c.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase border ${complaintTypeLabel(c.tipus).color}`}>
                                {complaintTypeLabel(c.tipus).text}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">{c.datum}</span>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-snug line-clamp-3">
                              {c.leiras}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              
              /* STANDARD FACTORY LIST VIEW */
              <div className="flex flex-col h-full min-h-0">
                {/* List Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between shrink-0">
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    Létesítmények ({filteredFactories.length} találat)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Kattints az adatokhoz
                  </span>
                </div>

                {/* Scroller */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
                  {filteredFactories.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-sans">Nincs a szűrésnek megfelelő létesítmény.</p>
                    </div>
                  ) : (
                    filteredFactories.map((factory) => {
                      const isSelected = selectedFactoryId === factory.id;
                      const status = statusLabel(factory.statusz);
                      const displayWater = factory.vizigeny_becsult || factory.vizigeny_hivatalos || 0;

                      return (
                        <div
                          key={factory.id}
                          onClick={() => {
                            setSelectedFactoryId(factory.id);
                            setActiveTab('map'); // Switch to map view to show center effect
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between gap-3 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500/55 shadow-sm shadow-blue-500/5'
                              : 'bg-white border-slate-200/80 hover:bg-slate-50/60 hover:border-slate-300'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            {/* Location & Status */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-450 uppercase tracking-wider">
                                {factory.helyszin}
                              </span>
                              <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-full border ${status.color}`}>
                                {status.text}
                              </span>
                            </div>

                            {/* Name */}
                            <h4 className="text-xs font-black text-slate-800 truncate">
                              {factory.nev}
                            </h4>

                            {/* Indicators bar */}
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                              <span className="flex items-center gap-0.5" title="Lakossági panaszok száma">
                                <AlertTriangle className="w-3 h-3 text-slate-450" />
                                {factory.lakossagi_bejelentesek_szama} jelzés
                              </span>
                              {factory.kapacitas_gwh && (
                                <span className="flex items-center gap-0.5">
                                  <Activity className="w-3 h-3 text-slate-455" />
                                  {factory.kapacitas_gwh} GWh
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Water demand graphic */}
                          <div className="flex flex-col items-end justify-center shrink-0">
                            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">Vízigény</span>
                            <span className="text-sm font-black text-sky-600 font-mono tracking-tight">
                              {displayWater > 0 ? `${displayWater.toLocaleString('hu-HU')}` : 'Nincs adat'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">m³/nap</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            )}
          </div>
        </section>

        {/* RIGHT PANEL: INTERACTIVE CONTENT, TABS (7 Columns) */}
        <section className="lg:col-span-7 flex flex-col gap-4 min-h-[500px] lg:max-h-[calc(100vh-170px)]">
          
          {/* Tab Selector Buttons - Tech styling */}
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/85 flex shrink-0 shadow-sm">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
              <span>Interaktív Térkép</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Elemzés & Debrecen</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Lakossági Jelzések ({complaints.length})</span>
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="flex-1 min-h-[500px] bg-white rounded-2xl overflow-hidden relative border border-slate-200">
            
            {/* TAB 1: MAP VIEW */}
            {activeTab === 'map' && (
              <div className="absolute inset-0 w-full h-full">
                <Map
                  factories={filteredFactories}
                  selectedFactoryId={selectedFactoryId}
                  onSelectFactory={setSelectedFactoryId}
                />
              </div>
            )}

            {/* TAB 2: DASHBOARD VIEW (Trend + Debrecen Analysis) */}
            {activeTab === 'dashboard' && (
              <div className="absolute inset-0 w-full h-full overflow-y-auto p-4 space-y-4">
                <DebrecenDashboard factories={factories} />
                <TrendChart factories={filteredFactories} selectedFactory={selectedFactory} />
              </div>
            )}

            {/* TAB 3: CITIZEN REPORTS LIST */}
            {activeTab === 'reports' && (
              <div className="absolute inset-0 w-full h-full overflow-y-auto p-4 space-y-4">
                
                {/* Search & Filter bar inside Reports */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                      Bejelentések szűrése
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Válaszd ki a megtekinteni kívánt problématípust
                    </p>
                  </div>

                  <select
                    value={selectedComplaintType}
                    onChange={(e) => setSelectedComplaintType(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                  >
                    <option value="all">Minden bejelentés kategória</option>
                    <option value="vizhiany">Vízhiány / talajvíz süllyedés</option>
                    <option value="vizminoseg">Vízszennyezés / vegyi anyagok</option>
                    <option value="zaj">Zajszennyezés / rezgések</option>
                    <option value="szag">Légszennyezés / szagok</option>
                    <option value="egyeb">Egyéb panaszok</option>
                  </select>
                </div>

                {/* Complaint Cards Grid */}
                <div className="space-y-3">
                  {filteredComplaints.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto animate-bounce" />
                      <p className="text-xs font-mono">Ebben a kategóriában még nincsenek bejelentések.</p>
                    </div>
                  ) : (
                    filteredComplaints.map((c) => {
                      const label = complaintTypeLabel(c.tipus);
                      return (
                        <div
                          key={c.id}
                          className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm space-y-3 hover:border-slate-300 transition-all"
                        >
                          {/* Header of card */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-slate-800">
                                {c.factoryName}
                              </span>
                              <span className={`px-2 py-0.5 text-[8.5px] font-bold rounded border uppercase ${label.color}`}>
                                {label.text}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {c.hitelesitett && (
                                <span className="text-[9px] font-mono font-semibold text-emerald-750 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <CheckCircle className="w-2.5 h-2.5" />
                                  Hitelesített
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">{c.datum}</span>
                            </div>
                          </div>

                          {/* Text description */}
                          <p className="text-xs text-slate-600 leading-relaxed font-sans font-light">
                            {c.leiras}
                          </p>

                          {/* Footer of card */}
                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                              Beküldte: <strong className="text-slate-700">{c.bekuldo_nev || 'Anonim állampolgár'}</strong>
                            </span>
                            
                            <button
                              onClick={() => {
                                setSelectedFactoryId(c.factoryId);
                                setActiveTab('map');
                              }}
                              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              Gyár adatai
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            )}

          </div>
        </section>

      </main>

      {/* REPORT SUBMISSION MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[2000] overflow-y-auto">
          <ReportForm
            factories={factories}
            onSubmit={handleNewComplaint}
            onClose={() => setShowReportModal(false)}
          />
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-100/40 border-t border-slate-200 py-4 px-6 text-center text-[10px] sm:text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2026 Akkugyárak Vízmérője Monitor Rendszer. Minden tartalom független adatgyűjtés eredménye.
          </p>
          <div className="flex gap-4">
            <a href="https://atlatszo.hu" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 text-slate-600 underline cursor-pointer">
              Átlátszó.hu
            </a>
            <a href="https://greenpeace.hu" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 text-slate-600 underline cursor-pointer">
              Greenpeace Magyarország
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
