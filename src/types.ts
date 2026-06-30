export type FactoryStatus = 'mukodik' | 'epulo' | 'tervezett';

export interface FactoryYearlyMetric {
  ev: number;
  fogyasztas_hivatalos: number;
  fogyasztas_becsult: number;
}

export interface Factory {
  id: string;
  nev: string;
  helyszin: string;
  koordinatak: [number, number];
  statusz: FactoryStatus;
  vizigeny_hivatalos: number | null; // m3/nap
  vizigeny_becsult: number | null; // m3/nap
  mertekegyseg: string;
  forras: string;
  forras_link?: string;
  megjegyzes: string;
  kapacitas_gwh: number | null;
  lakossagi_bejelentesek_szama: number;
  eves_adatok: FactoryYearlyMetric[]; // 5-year metrics (2022 to 2026)
}

export type ComplaintType = 'vizminoseg' | 'vizhiany' | 'zaj' | 'szag' | 'egyeb';

export interface Complaint {
  id: string;
  factoryId: string;
  factoryName: string;
  datum: string;
  tipus: ComplaintType;
  leiras: string;
  bekuldo_nev?: string;
  bekuldo_email?: string;
  hitelesitett: boolean;
}
