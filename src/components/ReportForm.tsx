import React, { useState } from 'react';
import { Factory, Complaint, ComplaintType } from '../types';

interface ReportFormProps {
  factories: Factory[];
  onSubmit: (complaint: Omit<Complaint, 'id' | 'hitelesitett'>) => void;
  onClose: () => void;
}

export default function ReportForm({ factories, onSubmit, onClose }: ReportFormProps) {
  const [factoryId, setFactoryId] = useState(factories[0]?.id || '');
  const [tipus, setTipus] = useState<ComplaintType>('vizminoseg');
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0]);
  const [leiras, setLeiras] = useState('');
  const [bekuldoNev, setBekuldoNev] = useState('');
  const [bekuldoEmail, setBekuldoEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryId) {
      setError('Kérjük, válassz ki egy gyárat!');
      return;
    }
    if (!leiras || leiras.trim().length < 15) {
      setError('Kérjük, részletesen írd le a bejelentés okát (legalább 15 karakter)!');
      return;
    }

    const selectedFactory = factories.find((f) => f.id === factoryId);
    if (!selectedFactory) {
      setError('Hiba történt a gyár kiválasztásakor.');
      return;
    }

    onSubmit({
      factoryId,
      factoryName: selectedFactory.nev,
      datum,
      tipus,
      leiras: leiras.trim(),
      bekuldo_nev: bekuldoNev.trim() || undefined,
      bekuldo_email: bekuldoEmail.trim() || undefined,
    });

    setSuccess(true);
    setError('');
    setLeiras('');
    setBekuldoNev('');
    setBekuldoEmail('');

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const typesMap: { value: ComplaintType; label: string; description: string }[] = [
    { value: 'vizhiany', label: 'Vízhiány / Talajvíz süllyedés', description: 'Kutak kiszáradása, talajvízszint süllyedés észlelése' },
    { value: 'vizminoseg', label: 'Vízszennyezés / Vegyi anyagok', description: 'Kútvíz minőségromlása, habzás, elszíneződés, gyanús lerakódások' },
    { value: 'zaj', label: 'Zajszennyezés / Rezgések', description: 'Éjszakai búgás, állandó morajlás, rezonancia a lakóházakban' },
    { value: 'szag', label: 'Légszennyezés / Kellemetlen szag', description: 'Szúrós, fojtogató gáz- vagy vegyi szagok szélcsendben' },
    { value: 'egyeb', label: 'Egyéb környezeti / Működési panasz', description: 'Rendkívüli kamionforgalom, megmagyarázhatatlan gőzkiáramlások' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl max-w-lg w-full">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            Új Lakossági Bejelentés
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Környezeti aggodalmak és anomáliák rögzítése</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {success ? (
        <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <h4 className="text-slate-900 font-bold text-base">Köszönjük a bejelentést!</h4>
          <p className="text-slate-500 text-xs max-w-xs">
            A panasz bekerült a helyi bejelentések adatbázisába, és frissítette a térképes panasz-statisztikákat.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700 flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}

          {/* Factory Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide font-mono">
              Érintett akkumulátorgyár
            </label>
            <select
              value={factoryId}
              onChange={(e) => setFactoryId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors"
            >
              <option value="" disabled>Válassz egy létesítményt...</option>
              {factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nev} ({f.helyszin})
                </option>
              ))}
            </select>
          </div>

          {/* Report Type */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide font-mono">
              Probléma kategóriája
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {typesMap.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setTipus(t.value)}
                  className={`p-2.5 text-left rounded-lg border transition-all flex flex-col items-start cursor-pointer ${
                    tipus === t.value
                      ? 'bg-blue-50 border-blue-500/80 text-blue-700 shadow-sm shadow-blue-500/5'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold font-sans">{t.label}</span>
                  <span className="text-[9px] mt-0.5 leading-tight opacity-80">{t.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide font-mono">
              Észlelés dátuma
            </label>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide font-mono">
              Részletes leírás / Tapasztalatok
            </label>
            <textarea
              value={leiras}
              onChange={(e) => setLeiras(e.target.value)}
              placeholder="Írd le a tapasztalt jelenséget (pl. kút apadása, fura szag, éjszakai zaj órái)..."
              rows={4}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Reporter info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide font-mono flex items-center gap-1">
                Beküldő neve <span className="text-slate-400 lowercase text-[10px]">(anonim is lehet)</span>
              </label>
              <input
                type="text"
                value={bekuldoNev}
                onChange={(e) => setBekuldoNev(e.target.value)}
                placeholder="Pl. Nagy János"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide font-mono flex items-center gap-1">
                E-mail cím <span className="text-slate-400 lowercase text-[10px]">(nem publikus)</span>
              </label>
              <input
                type="email"
                value={bekuldoEmail}
                onChange={(e) => setBekuldoEmail(e.target.value)}
                placeholder="pl. janos@pelda.hu"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Mégse
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg shadow-md shadow-blue-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Bejelentés rögzítése
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
