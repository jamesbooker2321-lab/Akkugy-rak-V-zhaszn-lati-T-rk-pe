import { 
  FileText, 
  Droplet, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Home, 
  Wrench, 
  ShieldAlert, 
  ChevronRight 
} from 'lucide-react';

export default function ZsambergReport() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50">
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase">
              AQUA-CRITICAL-MAP // ESETTANULMÁNY
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Páty és a Zsámbéki-medence Vízválsága
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Hidrológiai és nehézipari ok-okozati összefüggések a végponti települések strukturális nyári vízhiánya és az Észak-dunántúli karsztvízrendszer túlterhelése között.
          </p>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-600" />
          Összefoglaló megállapítás
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Jelen jelentés a Páty községet és a Zsámbéki-medence kritikus végponti településeit érintő strukturális vízhiány ok-okozati összefüggéseit vizsgálja. Az adatok igazolják, hogy a <strong className="text-slate-900">helyi hálózati veszteségek</strong> és a regionális karsztvízrendszerre nehezedő <strong className="text-slate-900">nehézipari (akkumulátorgyártási) extrakció</strong> együttesen felelősek a kialakult ellátási instabilitásért.
        </p>
      </div>

      {/* GRID SECTION 1 & 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* POINT 1: HIDROLÓGIAI ÖSSZEFÜGGÉS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <Layers className="w-4 h-4 text-sky-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              1. A Pátyot Érintő Hidrológiai Összefüggés
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed space-y-2">
              A térség ivóvízellátása nem független helyi rendszereken alapul, hanem strukturálisan beágyazódik az <strong className="text-slate-900">Észak-dunántúli karsztvízrendszerbe</strong>. Páty, Telki, Budajenő és Zsámbék ivóvize közvetlenül a tatabányai XIV/A és XV/C vízaknákból származik.
            </p>
          </div>
          
          <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-3.5 space-y-2">
            <span className="text-[10px] font-mono font-bold text-sky-700 uppercase tracking-wider block">
              A Végponti Hatás (Terminal Effect)
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Hidraulikai szempontból a Zsámbéki-medence települései a regionális gerinchálózat végpontjain fekszenek. Bármilyen nyomáscsökkenés vagy megnövekedett kitermelés a forrásvidéken azonnali, hatványozott nyomásesést generál a pátyi elosztóhálózat végágain.
            </p>
          </div>
        </div>

        {/* POINT 3: LOKÁLIS MUTALÁSOK */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Home className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              3. Lokális Strukturális Mulasztások
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Az országos ipari elszívás mellett a helyi infrastruktúra-politika is hozzájárult a krízishez. Az elmúlt években végrehajtott intenzív ingatlanpiaci és lakópark-fejlesztéseket (agglomerációs nyomás) nem követte a víziközmű-hálózat keresztmetszetének és tározókapacitásának arányos bővítése.
            </p>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider block">
              Infrastruktúra-olló
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              A lakosság dinamikus növekedését és a helyi ipari övezetek bővülését nem követte a vízhálózat kapacitásának tározási vagy hidraulikai fejlesztése, ami aszály idején kritikus szintet ér el.
            </p>
          </div>
        </div>

      </div>

      {/* POINT 2: IPARI TERHELÉSI ADATOK TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Droplet className="w-4.5 h-4.5 text-blue-500" />
            2. Ipari Terhelési Adatok: SK On (Komárom) és Környéke
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            A tatabányai karsztvízbázis terhelése az elmúlt időszakban jelentősen megemelkedett az akkumulátoripari expanzió kiszolgálása érdekében.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Metrika / Paraméter</th>
                <th className="py-3 px-5 text-right">Hivatalos / Mért Érték</th>
                <th className="py-3 px-5">Rendszerszintű Hatás</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3.5 px-5 font-bold text-slate-950">SK On Komárom Max. Vízigény</td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-blue-600">4 100 m³/nap</td>
                <td className="py-3.5 px-5 text-slate-600 leading-relaxed">
                  Meghaladja Komárom és Ács teljes napi lakossági vízigényét.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-bold text-slate-950">Új Állami Távvezeték Kapacitás</td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-sky-600">10 000 – 22 000 m³/nap</td>
                <td className="py-3.5 px-5 text-slate-600 leading-relaxed">
                  Közvetlen karsztvíz-szállítás Tatabánya térségéből a komáromi ipari parkba, csökkentve a regionális puffert.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-5 font-bold text-slate-950">Hálózati Veszteség (Elöregedés)</td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-amber-600">20% – 30%</td>
                <td className="py-3.5 px-5 text-slate-600 leading-relaxed">
                  A kitermelt ivóvíz közel harmada elszivárog az elöregedett csővezetékek miatt.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/70 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200/55 p-3.5 rounded-xl space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Evaporatív Hűtés
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              A gyári hűtőtornyok folyamatos működtetése során a tiszta karsztvíz jelentős része elpárolog, ami tartós vízveszteséget és mikroklíma-módosító hatást eredményez.
            </p>
          </div>
          <div className="bg-white border border-slate-200/55 p-3.5 rounded-xl space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Vegyi Tisztítás
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Az akkumulátor-elektródák és egyéb alkatrészek gyártási folyamata során felmerülő rendkívül nagy mennyiségű ultra-tiszta mosási és öblítési vízigény.
            </p>
          </div>
        </div>
      </div>

      {/* JAVASOLT STRATÉGIAI AKCIÓTERV */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
          <Wrench className="w-4 h-4 text-slate-600" />
          4. Javasolt Stratégiai Akcióterv (Mérnöki Javaslatok)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              01 / REKONSTRUKCIÓ
            </span>
            <h5 className="font-bold text-slate-900 text-xs">
              Azonnali Csőrekonstrukció
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              A 20-30%-os lokális hálózati veszteség radikális csökkentése célzott zónázással, műszeres szivárgásvizsgálattal és intelligens nyomásmenedzsmenttel.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
            <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              02 / PUFFERELÉS
            </span>
            <h5 className="font-bold text-slate-900 text-xs">
              Ipari Pufferelés Kötelezése
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Jogszabályi nyomásgyakorlás, hogy a komáromi nehézipari üzemek saját zárt körfolyamatú szürkevíz-újrahasznosítót és több napos saját tározókapacitást építsenek ki, mentesítve a karsztvízrendszert aszálykor.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              03 / MORATÓRIUM
            </span>
            <h5 className="font-bold text-slate-900 text-xs">
              Települési Moratórium
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              További nagy kapacitású lakópark-engedélyek és ipari bővítések felfüggesztése a hidro-infrastruktúra és a tározók geometriai bővítéséig.
            </p>
          </div>

        </div>
      </div>

      {/* FOOTER DISCLAIMER */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex gap-3 items-start">
        <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-relaxed">
          <strong>Jogi és Forrásvédelmi Nyilatkozat:</strong> A jelen jelentésben rögzített adatok és összefüggések nyilvánosan elérhető civil bejelentéseken, helyi önkormányzati tényfeltárásokon, valamint az Észak-dunántúli karsztvízrendszer hivatalos üzemi adatain alapulnak. A dokumentum célja a transzparencia és a kritikus infrastruktúra-védelmi lakossági tervezés elősegítése.
        </p>
      </div>

    </div>
  );
}
