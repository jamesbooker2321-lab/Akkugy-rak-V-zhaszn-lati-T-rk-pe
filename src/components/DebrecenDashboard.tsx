import { Factory } from '../types';

interface DebrecenDashboardProps {
  factories: Factory[];
}

export default function DebrecenDashboard({ factories }: DebrecenDashboardProps) {
  // Filter Debrecen factories
  const debrecenFactories = factories.filter((f) => f.helyszin.toLowerCase() === 'debrecen');

  // Sum water metrics
  const totalOfficial = debrecenFactories.reduce((sum, f) => sum + (f.vizigeny_hivatalos || 0), 0);
  const totalEstimated = debrecenFactories.reduce((sum, f) => sum + (f.vizigeny_becsult || 0), 0);

  // Debrecen city residential consumption benchmark: ~30,000 m3 / day
  const debrecenCityResidential = 30000;

  // Percentage compared to city residential consumption
  const officialPercentage = Math.round((totalOfficial / debrecenCityResidential) * 100);
  const estimatedPercentage = Math.round((totalEstimated / debrecenCityResidential) * 100);

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
            Debrecen Fókusz: A Vízválság epicentruma
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          A CATL és az EVE Power gigaberuházásai miatt Debrecen a leginkább kitett régió.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Lakossági Fogyasztás
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800 tracking-tight">30 000</span>
            <span className="text-xs text-slate-500 font-mono">m³/nap</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-normal">
            Debrecen teljes lakosságának (~200 000 fő) átlagos napi ivóvíz igénye.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">
            Gyárak Hivatalos Igénye
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 tracking-tight">
              {totalOfficial.toLocaleString('hu-HU')}
            </span>
            <span className="text-xs text-emerald-500 font-mono">m³/nap</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-normal">
            A debreceni akkugyárak KHT engedélyben szereplő összesített vízfogyasztása ({officialPercentage}%-a a lakosságinak).
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
            Gyárak Becsült Csúcs Igénye
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-600 tracking-tight">
              {totalEstimated.toLocaleString('hu-HU')}
            </span>
            <span className="text-xs text-blue-500 font-mono">m³/nap</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-normal">
            Oknyomozó tanulmányok és vízügyi csatlakozási tervek szerinti maximális csúcsigény ({estimatedPercentage}%-a a lakosságinak).
          </p>
        </div>
      </div>

      {/* Visual Progress / Comparison bars */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
        <h4 className="text-xs font-bold font-mono text-slate-700 uppercase tracking-wider">
          Vízigény összehasonlító arányok
        </h4>

        {/* Bar 1: City */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-slate-500">
            <span>Debrecen Lakossági Vízfogyasztása</span>
            <span className="text-slate-800 font-bold">100% (30 000 m³/nap)</span>
          </div>
          <div className="w-full h-3 bg-slate-200/60 rounded-full overflow-hidden border border-slate-300/10">
            <div className="h-full bg-slate-400 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Bar 2: Official */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-slate-500">
            <span>Akkugyárak Hivatalos Vállalása (CATL + EVE)</span>
            <span className="text-emerald-600 font-bold">{officialPercentage}% ({totalOfficial.toLocaleString('hu-HU')} m³/nap)</span>
          </div>
          <div className="w-full h-3 bg-slate-200/60 rounded-full overflow-hidden border border-slate-300/10">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(officialPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Bar 3: Estimated */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-slate-500">
            <span>Akkugyárak Becsült / Valós Csúcsfogyasztása</span>
            <span className="text-blue-600 font-bold">{estimatedPercentage}% ({totalEstimated.toLocaleString('hu-HU')} m³/nap)</span>
          </div>
          <div className="w-full h-3 bg-slate-200/60 rounded-full overflow-hidden border border-slate-300/10 relative">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(estimatedPercentage, 100)}%` }}
            ></div>
            {estimatedPercentage > 100 && (
              <div
                className="absolute top-0 right-0 h-full bg-rose-500 opacity-60 rounded-r-full"
                style={{ width: `${Math.min(estimatedPercentage - 100, 100)}%`, left: '100%' }}
              ></div>
            )}
          </div>
          {estimatedPercentage > 100 && (
            <p className="text-[10px] text-rose-600 font-semibold font-mono mt-1">
              ⚠️ FIGYELEM: A becsült ipari igény meghaladja a teljes lakossági vízkapacitást!
            </p>
          )}
        </div>
      </div>

      {/* Critical Analysis Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-slate-800 font-mono">A CIVAQUA-program és az ipar</h5>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            A CIVAQUA-program eredetileg évtizedes civil álomként indult, hogy a Tisza folyó vizét eljuttassa a kiszáradó Erdőspusztákba és a Tócó-érbe ökológiai rehabilitáció és a helyi mezőgazdaság támogatása céljából. 
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Civil aggodalmak és kiszivárgott vízügyi dokumentumok szerint a program prioritásait átrendezték, így a kiépített csatornák vizét részben az ipari parkokba irányítják, hogy ott a CATL és más gyárak hűtővizét és a keletkező ipari szennyvíz hígítását biztosítsák.
          </p>
        </div>

        <div className="space-y-2">
          <h5 className="text-xs font-bold text-slate-800 font-mono">Vízbázis kockázatok</h5>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Debrecen mélységi rétegvíz-készlete kiváló minőségű ivóvizet biztosít. Bár a hatóságok hangsúlyozzák, hogy a gyárakat részben szürkevízzel (városi tisztított szennyvíz) hűtik, a technológiai tisztítási fázisokhoz továbbra is szükség van több ezer köbméter tiszta rétegvízre.
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            A kiterjedt csatornázás és a talajvíz nagymértékű lecsapolása növeli az aszályok kockázatát, különösen a Tiszántúl amúgy is szárazodó, homokhátsági területein.
          </p>
        </div>
      </div>
    </div>
  );
}
