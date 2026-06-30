import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Factory } from '../types';

interface MapProps {
  factories: Factory[];
  selectedFactoryId: string | null;
  onSelectFactory: (id: string) => void;
}

export default function Map({ factories, selectedFactoryId, onSelectFactory }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  // Clean default icon URLs to prevent asset loading issues
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Set up global click handler for popup buttons
  useEffect(() => {
    (window as any).onMapDetailsClick = (id: string) => {
      onSelectFactory(id);
    };
    return () => {
      delete (window as any).onMapDetailsClick;
    };
  }, [onSelectFactory]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create Leaflet Map centered on Hungary
    const map = L.map(mapContainerRef.current, {
      center: [47.15, 19.50],
      zoom: 7.2,
      minZoom: 6,
      maxZoom: 16,
      zoomControl: false, // will add in a custom position
    });

    // Add Zoom Control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org" target="_blank" rel="noreferrer">OpenStreetMap</a>'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers when factories change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Helper to get status colors
    const getStatusColors = (status: string) => {
      switch (status) {
        case 'mukodik':
          return { ring: 'bg-emerald-500/30', dot: 'bg-emerald-500' };
        case 'epulo':
          return { ring: 'bg-amber-500/30', dot: 'bg-amber-500' };
        case 'tervezett':
          return { ring: 'bg-rose-500/30', dot: 'bg-rose-500' };
        default:
          return { ring: 'bg-slate-500/30', dot: 'bg-slate-500' };
      }
    };

    // Add markers for current filtered factories
    factories.forEach((factory) => {
      const colors = getStatusColors(factory.statusz);
      
      // Custom HTML Marker matching light theme
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="custom-pulse-ring absolute w-8 h-8 rounded-full ${colors.ring}"></div>
            <div class="custom-pulse-dot w-3.5 h-3.5 rounded-full border-2 border-white ${colors.dot} shadow-md shadow-black/20"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -10],
      });

      // Construct popup HTML (Light theme Professional Polish style)
      const statusLabels = {
        mukodik: { text: 'Működik', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' },
        epulo: { text: 'Épülő', color: 'bg-amber-50 text-amber-700 border-amber-200/80' },
        tervezett: { text: 'Tervezett', color: 'bg-rose-50 text-rose-700 border-rose-200/80' }
      };
      
      const status = statusLabels[factory.statusz];
      const officialWater = factory.vizigeny_hivatalos ? `${factory.vizigeny_hivatalos.toLocaleString('hu-HU')} m³/nap` : 'Nincs hivatalos adat';
      const estimatedWater = factory.vizigeny_becsult ? `${factory.vizigeny_becsult.toLocaleString('hu-HU')} m³/nap` : 'Nincs becsült adat';
      const waterForCalc = factory.vizigeny_becsult || factory.vizigeny_hivatalos || 0;
      const households = Math.round((waterForCalc * 365) / 110);

      const popupHtml = `
        <div class="p-4 bg-white max-w-[280px] text-slate-700 rounded-xl">
          <div class="flex items-center justify-between mb-2 gap-2">
            <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">${factory.helyszin}</span>
            <span class="px-2 py-0.5 text-[9px] font-bold rounded-full border ${status.color}">${status.text}</span>
          </div>
          <h3 class="font-bold text-slate-900 text-sm mb-1 line-clamp-1">${factory.nev}</h3>
          <p class="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-3">${factory.megjegyzes}</p>
          
          <div class="space-y-1.5 mb-3 border-t border-b border-slate-100 py-2">
            <div class="flex justify-between text-[11px]">
              <span class="text-slate-400">Hivatalos vízigény:</span>
              <span class="font-semibold text-slate-800">${officialWater}</span>
            </div>
            <div class="flex justify-between text-[11px]">
              <span class="text-slate-400">Civil/oknyomozó becsült csúcs:</span>
              <span class="font-bold text-blue-600">${estimatedWater}</span>
            </div>
          </div>
          
          ${waterForCalc > 0 ? `
          <div class="flex items-start gap-1.5 bg-blue-50/50 p-2 rounded border border-blue-100/50 mb-3 text-[10px] text-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mt-0.5 shrink-0 text-blue-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <div>
              Évi <strong class="text-slate-900 font-semibold">${households.toLocaleString('hu-HU')}</strong> háztartás vízigénye.
            </div>
          </div>
          ` : ''}
          
          <button class="w-full text-center py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-[11px] rounded-lg transition-all cursor-pointer" onclick="window.onMapDetailsClick('${factory.id}')">
            Részletes Adatlap megtekintése
          </button>
        </div>
      `;

      const marker = L.marker(factory.koordinatak, { icon: customIcon })
        .bindPopup(popupHtml, {
          closeButton: false,
          minWidth: 260,
          maxWidth: 280,
        })
        .addTo(map);

      // Trigger select on click
      marker.on('click', () => {
        onSelectFactory(factory.id);
      });

      markersRef.current[factory.id] = marker;
    });
  }, [factories, onSelectFactory]);

  // Handle selected factory zoom and popup trigger
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedFactoryId) return;

    const marker = markersRef.current[selectedFactoryId];
    if (marker) {
      const position = marker.getLatLng();
      
      // Fly to factory with nice animation
      map.flyTo(position, 10, {
        animate: true,
        duration: 1.2
      });

      // Delay popup opening slightly to allow flyTo to complete or start
      setTimeout(() => {
        marker.openPopup();
      }, 500);
    }
  }, [selectedFactoryId]);

  return (
    <div className="w-full h-full relative group">
      {/* Map Element */}
      <div id="map-canvas" ref={mapContainerRef} className="w-full h-full rounded-2xl border border-slate-200 shadow-md shadow-slate-100/40 overflow-hidden" />

      {/* Map Legend - Glassmorphism */}
      <div className="absolute top-4 left-4 z-[500] bg-white/95 backdrop-blur-md border border-slate-200/80 px-4 py-3 rounded-xl shadow-md pointer-events-auto">
        <h4 className="text-xs font-bold text-slate-850 mb-2 uppercase tracking-wider font-mono">Státusz Jelmagyarázat</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm"></span>
            <span className="text-slate-600 font-medium">Működik / Próbaüzem</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm"></span>
            <span className="text-slate-600 font-medium">Építés alatt</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 border border-white shadow-sm"></span>
            <span className="text-slate-600 font-medium">Tervezett beruházás</span>
          </div>
        </div>
      </div>
    </div>
  );
}
