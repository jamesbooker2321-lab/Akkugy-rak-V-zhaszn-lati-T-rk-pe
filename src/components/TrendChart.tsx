import { useState } from 'react';
import { Factory } from '../types';

interface TrendChartProps {
  factories: Factory[];
  selectedFactory: Factory | null;
}

export default function TrendChart({ factories, selectedFactory }: TrendChartProps) {
  const [useSelectedOnly, setUseSelectedOnly] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    year: number;
    official: number;
    estimated: number;
    x: number;
    yOfficial: number;
    yEstimated: number;
  } | null>(null);

  // Generate 5-year trend data from 2022 to 2026
  const years = [2022, 2023, 2024, 2025, 2026];

  const trendData = years.map((year) => {
    if (useSelectedOnly && selectedFactory) {
      const metric = selectedFactory.eves_adatok.find((d) => d.ev === year);
      return {
        ev: year,
        official: metric ? metric.fogyasztas_hivatalos : 0,
        estimated: metric ? metric.fogyasztas_becsult : 0,
      };
    } else {
      // Aggregate across all visible factories
      let officialSum = 0;
      let estimatedSum = 0;
      factories.forEach((factory) => {
        const metric = factory.eves_adatok.find((d) => d.ev === year);
        if (metric) {
          officialSum += metric.fogyasztas_hivatalos;
          estimatedSum += metric.fogyasztas_becsult;
        }
      });
      return {
        ev: year,
        official: officialSum,
        estimated: estimatedSum,
      };
    }
  });

  // SVG Chart Dimensions
  const width = 500;
  const height = 220;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find max value for scaling
  const maxVal = Math.max(
    ...trendData.map((d) => Math.max(d.official, d.estimated, 1000))
  ) * 1.1; // Add 10% headroom

  // Helper to scale values to SVG coordinates
  const getX = (index: number) => {
    return paddingLeft + (index / (years.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / maxVal) * chartHeight;
  };

  // Generate SVG path for a line
  const getLinePath = (dataKey: 'official' | 'estimated') => {
    return trendData
      .map((d, i) => {
        const x = getX(i);
        const y = getY(d[dataKey]);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  // Generate SVG path for an area
  const getAreaPath = (dataKey: 'official' | 'estimated') => {
    const linePath = getLinePath(dataKey);
    if (!linePath) return '';
    const startX = getX(0);
    const endX = getX(years.length - 1);
    const bottomY = paddingTop + chartHeight;
    return `${linePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  };

  // Aggregation labels
  const title = useSelectedOnly && selectedFactory
    ? `${selectedFactory.nev} Vízfogyasztási Trendje`
    : 'Országos Összesített Vízhasználati Trend (2022-2026)';

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Trendelemzés és Változások
          </h3>
          <p className="text-xs text-slate-500 mt-1">Ipari vízigény növekedési görbe (m³/nap)</p>
        </div>

        {selectedFactory && (
          <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setUseSelectedOnly(false)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                !useSelectedOnly
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Országos
            </button>
            <button
              onClick={() => setUseSelectedOnly(true)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                useSelectedOnly
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Kiválasztott gyár
            </button>
          </div>
        )}
      </div>

      <div className="text-xs font-semibold text-slate-700 mb-3 font-mono border-l-2 border-blue-600 pl-2">
        {title}
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full text-slate-500 select-none overflow-visible"
        >
          {/* Y-Axis Gridlines & Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const val = Math.round(maxVal * ratio);
            const y = getY(val);
            return (
              <g key={i} className="opacity-80">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* X-Axis Labels */}
          {years.map((year, i) => {
            const x = getX(i);
            const y = paddingTop + chartHeight + 16;
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-mono font-bold"
              >
                {year}
              </text>
            );
          })}

          {/* Area under curves */}
          <path
            d={getAreaPath('official')}
            fill="url(#grad-official)"
            className="opacity-15 transition-all duration-500"
          />
          <path
            d={getAreaPath('estimated')}
            fill="url(#grad-estimated)"
            className="opacity-15 transition-all duration-500"
          />

          {/* Lines */}
          <path
            d={getLinePath('official')}
            fill="none"
            stroke="#10b981" // emerald-500
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <path
            d={getLinePath('estimated')}
            fill="none"
            stroke="#0ea5e9" // sky-500
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-500"
          />

          {/* Data Points (Circles) */}
          {trendData.map((d, i) => {
            const x = getX(i);
            const yOfficial = getY(d.official);
            const yEstimated = getY(d.estimated);

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    year: d.ev,
                    official: d.official,
                    estimated: d.estimated,
                    x,
                    yOfficial,
                    yEstimated,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Invisible hover helper */}
                <rect
                  x={x - 25}
                  y={paddingTop}
                  width="50"
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Official Dot */}
                <circle
                  cx={x}
                  cy={yOfficial}
                  r={hoveredPoint?.year === d.ev ? 6 : 4}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />

                {/* Estimated Dot */}
                <circle
                  cx={x}
                  cy={yEstimated}
                  r={hoveredPoint?.year === d.ev ? 6 : 4}
                  fill="#0ea5e9"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="grad-official" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad-estimated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute bg-white/95 backdrop-blur-sm border border-slate-200 p-2.5 rounded-xl shadow-lg text-[11px] text-slate-700 pointer-events-none z-10 space-y-1 font-mono"
            style={{
              left: `${Math.min(hoveredPoint.x - 65, width - 150)}px`,
              top: `${Math.min(Math.min(hoveredPoint.yOfficial, hoveredPoint.yEstimated) - 80, height - 100)}px`,
              width: '140px',
            }}
          >
            <div className="font-bold border-b border-slate-100 pb-1 text-slate-900 mb-1 text-center">
              Év: {hoveredPoint.year}
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600">Hivatalos:</span>
              <span className="font-semibold">{hoveredPoint.official.toLocaleString('hu-HU')} m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-600">Becsült:</span>
              <span className="font-semibold">{hoveredPoint.estimated.toLocaleString('hu-HU')} m³</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Context info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <span className="text-slate-600">Hivatalos (KHT engedélyek)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-sky-500"></span>
            <span className="text-slate-600">Független becsült (Csúcs)</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          *m³/nap: napi köbméter fogyasztás
        </div>
      </div>
    </div>
  );
}
