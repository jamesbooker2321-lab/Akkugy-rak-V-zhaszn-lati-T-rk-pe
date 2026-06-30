import { Factory, Complaint } from './types';

export const INITIAL_FACTORIES: Factory[] = [
  {
    id: 'h-catl-01',
    nev: 'CATL Debrecen',
    helyszin: 'Debrecen',
    koordinatak: [47.53, 21.62],
    statusz: 'mukodik',
    vizigeny_hivatalos: 5000,
    vizigeny_becsult: 42500,
    mertekegyseg: 'm3/nap',
    forras: 'Átlátszó oknyomozó riport / Debreceni Vízmű Tanulmány',
    forras_link: 'https://atlatszo.hu/orszagszerte/2025/01/szazmilliardok-az-akkugyar-vizellatasara-mikozben-a-lakossagi-vizhalozat-lepusztul/',
    megjegyzes: '108 milliárd Ft-os debreceni program része. A Keleti-főcsatorna vízkivételi tisztítóműve meghiúsult. A gyári hőcserélők miatt a belépő víz 85%-a elpárolog, ami ipari hóesést és mikroklíma-változást okozhat a reptér mellett. A CIVAQUA program II. fázisa állami források híján leállt.',
    kapacitas_gwh: 100,
    lakossagi_bejelentesek_szama: 18,
    eves_adatok: [
      { ev: 2022, fogyasztas_hivatalos: 0, fogyasztas_becsult: 0 },
      { ev: 2023, fogyasztas_hivatalos: 150, fogyasztas_becsult: 1200 },
      { ev: 2024, fogyasztas_hivatalos: 600, fogyasztas_becsult: 3200 },
      { ev: 2025, fogyasztas_hivatalos: 1800, fogyasztas_becsult: 18500 },
      { ev: 2026, fogyasztas_hivatalos: 5000, fogyasztas_becsult: 42500 }
    ]
  },
  {
    id: 'h-samsung-01',
    nev: 'Samsung SDI Göd',
    helyszin: 'Göd',
    koordinatak: [47.701, 19.143],
    statusz: 'mukodik',
    vizigeny_hivatalos: 3500,
    vizigeny_becsult: 10000,
    mertekegyseg: 'm3/nap',
    forras: 'Átlátszó oknyomozó riport / Göd-ÉRT',
    forras_link: 'https://atlatszo.hu/orszagszerte/2025/01/szazmilliardok-az-akkugyar-vizellatasara-mikozben-a-lakossagi-vizhalozat-lepusztul/',
    megjegyzes: '34,5 milliárd Ft-os giga-infrastruktúra (Mészáros és Mészáros). A gyárat a Chinoin-szennyezés miatt 40 éve lezárt váci kutak újranyitásával látják el (napi 27 000 m3). A gyár titkosítja a szennyvíz összetételét. Teljes tarvágás a sződligeti Duna-parton (1.5 km Natura 2000 terület).',
    kapacitas_gwh: 40,
    lakossagi_bejelentesek_szama: 24,
    eves_adatok: [
      { ev: 2022, fogyasztas_hivatalos: 2200, fogyasztas_becsult: 6800 },
      { ev: 2023, fogyasztas_hivatalos: 2800, fogyasztas_becsult: 8200 },
      { ev: 2024, fogyasztas_hivatalos: 3200, fogyasztas_becsult: 9200 },
      { ev: 2025, fogyasztas_hivatalos: 3500, fogyasztas_becsult: 9800 },
      { ev: 2026, fogyasztas_hivatalos: 3500, fogyasztas_becsult: 10000 }
    ]
  },
  {
    id: 'h-skon-kom',
    nev: 'SK On Komárom',
    helyszin: 'Komárom',
    koordinatak: [47.731, 18.121],
    statusz: 'mukodik',
    vizigeny_hivatalos: 2000,
    vizigeny_becsult: 5500,
    mertekegyseg: 'm3/nap',
    forras: 'Katasztrófavédelmi KHT dokumentumok',
    megjegyzes: 'Két gyáregység üzemel. A helyi lakosság többször panaszkodott nehéz gépjárműforgalomra és alkalmankénti szúrós szagra. Korábban több munkahelyi baleset történt vegyi anyagok expozíciója miatt.',
    kapacitas_gwh: 17.5,
    lakossagi_bejelentesek_szama: 7,
    eves_adatok: [
      { ev: 2022, fogyasztas_hivatalos: 1600, fogyasztas_becsult: 4200 },
      { ev: 2023, fogyasztas_hivatalos: 1900, fogyasztas_becsult: 5000 },
      { ev: 2024, fogyasztas_hivatalos: 2000, fogyasztas_becsult: 5300 },
      { ev: 2025, fogyasztas_hivatalos: 2000, fogyasztas_becsult: 5400 },
      { ev: 2026, fogyasztas_hivatalos: 2000, fogyasztas_becsult: 5500 }
    ]
  },
  {
    id: 'h-skon-iv',
    nev: 'SK On Iváncsa',
    helyszin: 'Iváncsa',
    koordinatak: [47.159, 18.918],
    statusz: 'mukodik',
    vizigeny_hivatalos: 3200,
    vizigeny_becsult: 9000,
    mertekegyseg: 'm3/nap',
    forras: 'Átlátszó oknyomozó riport / Fejér Megyei Hivatal',
    forras_link: 'https://atlatszo.hu/orszagszerte/2025/01/szazmilliardok-az-akkugyar-vizellatasara-mikozben-a-lakossagi-vizhalozat-lepusztul/',
    megjegyzes: '40 milliárd Ft közpénzből épült víziközmű (Mészáros és Mészáros). A szennyvízcsatorna 4 km hosszan lakóházak és Natura 2000 területek alatt vezet a Dunáig. A végleges duna-medri bevezetés még nem készült el.',
    kapacitas_gwh: 30,
    lakossagi_bejelentesek_szama: 11,
    eves_adatok: [
      { ev: 2022, fogyasztas_hivatalos: 0, fogyasztas_becsult: 200 },
      { ev: 2023, fogyasztas_hivatalos: 300, fogyasztas_becsult: 1800 },
      { ev: 2024, fogyasztas_hivatalos: 1500, fogyasztas_becsult: 5200 },
      { ev: 2025, fogyasztas_hivatalos: 2800, fogyasztas_becsult: 7800 },
      { ev: 2026, fogyasztas_hivatalos: 3200, fogyasztas_becsult: 9000 }
    ]
  },
  {
    id: 'h-byd-01',
    nev: 'BYD Szeged',
    helyszin: 'Szeged',
    koordinatak: [46.282, 20.091],
    statusz: 'epulo',
    vizigeny_hivatalos: 1500,
    vizigeny_becsult: 8000,
    mertekegyseg: 'm3/nap',
    forras: 'Szeged Megyei Jogú Város Fejlesztési Tervek',
    megjegyzes: 'Integrált elektromos autógyár és akkumulátorcellák összeszerelő egysége. Bár a Tisza folyó közelsége vízügyileg kedvező, a gyár építése kiterjedt mezőgazdasági területek végleges kivonását és jelentős infrastrukturális átalakítást igényel.',
    kapacitas_gwh: 20,
    lakossagi_bejelentesek_szama: 3,
    eves_adatok: [
      { ev: 2022, fogyasztas_hivatalos: 0, fogyasztas_becsult: 0 },
      { ev: 2023, fogyasztas_hivatalos: 0, fogyasztas_becsult: 0 },
      { ev: 2024, fogyasztas_hivatalos: 50, fogyasztas_becsult: 300 },
      { ev: 2025, fogyasztas_hivatalos: 400, fogyasztas_becsult: 2100 },
      { ev: 2026, fogyasztas_hivatalos: 1500, fogyasztas_becsult: 8000 }
    ]
  },
  {
    id: 'h-eve-01',
    nev: 'EVE Power Debrecen',
    helyszin: 'Debrecen',
    koordinatak: [47.519, 21.681],
    statusz: 'epulo',
    vizigeny_hivatalos: 1200,
    vizigeny_becsult: 4500,
    mertekegyseg: 'm3/nap',
    forras: 'Környezetvédelmi Hatásvizsgálati Dokumentáció',
    megjegyzes: 'A BMW gyár közvetlen beszállítójaként épülő üzem hengeres akkumulátorcellák gyártására. A gyár hangsúlyozza, hogy a vízigény egy részét szürkevízből (tisztított városi szennyvíz) fogja fedezni a lakossági feszültség enyhítésére.',
    kapacitas_gwh: 28,
    lakossagi_bejelentesek_szama: 4,
    eves_adatok: [
      { ev: 2022, fogyasztas_hivatalos: 0, fogyasztas_becsult: 0 },
      { ev: 2023, fogyasztas_hivatalos: 0, fogyasztas_becsult: 0 },
      { ev: 2024, fogyasztas_hivatalos: 50, fogyasztas_becsult: 200 },
      { ev: 2025, fogyasztas_hivatalos: 250, fogyasztas_becsult: 1200 },
      { ev: 2026, fogyasztas_hivatalos: 1200, fogyasztas_becsult: 4500 }
    ]
  },
  {
    id: 'h-sunwoda-01',
    nev: 'Sunwoda Nyíregyháza',
    helyszin: 'Nyíregyháza',
    koordinatak: [47.925, 21.758],
    statusz: 'tervezett',
    vizigeny_hivatalos: 1000,
    vizigeny_becsult: 6500,
    mertekegyseg: 'm3/nap',
    forras: 'Nyíregyházi Ipari Park KHT beadványok',
    megjegyzes: 'A tervek bejelentésekor heves lakossági és civil ellenállás bontakozott ki, aláírásgyűjtésekkel és zajos közmeghallgatásokkal. Jelenleg a telephely előkészítése és engedélyeztetése zajlik.',
    kapacitas_gwh: 15,
    lakossagi_bejelentesek_szama: 5,
    eves_adatok: [
      { ev: 2022, fogyasztas_hivatalos: 0, fogyasztas_becsult: 0 },
      { ev: 2023, fogyasztas_hivatalos: 0, fogyasztas_becsult: 0 },
      { ev: 2024, fogyasztas_hivatalos: 0, fogyasztas_becsult: 50 },
      { ev: 2025, fogyasztas_hivatalos: 50, fogyasztas_becsult: 800 },
      { ev: 2026, fogyasztas_hivatalos: 1000, fogyasztas_becsult: 6500 }
    ]
  },
  {
    id: 'h-gs-01',
    nev: 'GS Yuasa Miskolc',
    helyszin: 'Miskolc',
    koordinatak: [48.069, 20.812],
    statusz: 'mukodik',
    vizigeny_hivatalos: 150,
    vizigeny_becsult: 500,
    mertekegyseg: 'm3/nap',
    forras: 'Borsod-Abaúj-Zemplén Vármegyei Kormányhivatal',
    megjegyzes: 'Kisebb alapterületű, elsősorban speciális lítium-ion és ólomsavas akkumulátorgyár. Méretéből és technológiájából adódóan kisebb a hűtővíz- és tisztítási vízigénye, így kevesebb lakossági konfliktussal jár.',
    kapacitas_gwh: 1.5,
    lakossagi_bejelentesek_szama: 1,
    eves_adatok: [
      { ev: 2022, fogyasztas_hivatalos: 110, fogyasztas_becsult: 420 },
      { ev: 2023, fogyasztas_hivatalos: 130, fogyasztas_becsult: 450 },
      { ev: 2024, fogyasztas_hivatalos: 150, fogyasztas_becsult: 480 },
      { ev: 2025, fogyasztas_hivatalos: 150, fogyasztas_becsult: 500 },
      { ev: 2026, fogyasztas_hivatalos: 150, fogyasztas_becsult: 500 }
    ]
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'c-01',
    factoryId: 'h-samsung-01',
    factoryName: 'Samsung SDI Göd',
    datum: '2026-06-15',
    tipus: 'zaj',
    leiras: 'Ismétlődő, rendkívül zavaró mélyfrekvenciás búgás hallatszik az éjszakai órákban a II. ütem felől. Csukott ablak mellett is rezonálnak az üvegek, lehetetlen pihenni.',
    bekuldo_nev: 'Kovács Melinda',
    bekuldo_email: 'melinda.kovacs@gmail.com',
    hitelesitett: true
  },
  {
    id: 'c-02',
    factoryId: 'h-samsung-01',
    factoryName: 'Samsung SDI Göd',
    datum: '2026-06-20',
    tipus: 'vizminoseg',
    leiras: 'A kertvégi ásott kút vizében a helyi civil szervezet által szervezett mérés során 12 µg/l lítiumot és nyomokban N-metil-2-pirrolidont (NMP) mutattak ki. Aggódunk a veteményes öntözése miatt.',
    bekuldo_nev: 'Szabó Péter',
    bekuldo_email: 'szabo.peter.god@freemail.hu',
    hitelesitett: true
  },
  {
    id: 'c-03',
    factoryId: 'h-catl-01',
    factoryName: 'CATL Debrecen',
    datum: '2026-06-25',
    tipus: 'vizhiany',
    leiras: 'A Mikepércshez közeli dűlőkön lévő mezőgazdasági kutak vízszintje drasztikusan, több mint 2 métert süllyedt az elmúlt félévben, mióta a gyár próbafázisa elindult. Félünk, hogy a teljes talajvízszint összeomlik a térségben.',
    bekuldo_nev: 'Nagy János',
    bekuldo_email: 'nagy.janos.farm@gmail.com',
    hitelesitett: true
  },
  {
    id: 'c-04',
    factoryId: 'h-skon-iv',
    factoryName: 'SK On Iváncsa',
    datum: '2026-06-28',
    tipus: 'szag',
    leiras: 'Esténként fura, szúrós vegyi szag telepszik Iváncsa észak-nyugati lakóövezetére szélcsendes időben. Több lakó torkának irritációjáról és száraz köhögésről számolt be.',
    bekuldo_nev: 'Tóth Eszter',
    bekuldo_email: 'eszti.toth93@citromail.hu',
    hitelesitett: false
  },
  {
    id: 'c-05',
    factoryId: 'h-skon-kom',
    factoryName: 'SK On Komárom',
    datum: '2026-06-12',
    tipus: 'egyeb',
    leiras: 'Hatalmas gőzkibocsátás és hirtelen süvítő hang hallatszott délután 3 körül a kettes üzem felől. Nem kaptunk tájékoztatást arról, hogy ez normál üzemi működés-e, vagy valamilyen üzemzavar.',
    bekuldo_nev: 'Kiss Gábor',
    bekuldo_email: 'kiss.gabor.kom@gmail.com',
    hitelesitett: true
  }
];

// Context helper functions for metrics
export const WATER_EQUIVALENCE_HOUSEHOLDS_PER_M3 = 365 * 0.12; // Average annual consumption of an individual is about 40-50m3. A typical household of 3 consumes ~120m3 per year. So 1 m3/day is (365 m3/year), which is roughly 3 households' annual consumption.
export const HUNGARIAN_HOUSEHOLD_YEARLY_M3 = 110; // m3/year/household
