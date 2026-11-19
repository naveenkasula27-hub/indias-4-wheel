// Base ex-showroom-equivalent reference price (₹) per brand+model, used as the
// starting point for the valuation engine. Each model has its own figure
// (not just one price per brand) so a hatchback and a flagship SUV from the
// same brand don't value the same. These are independent approximate market
// reference points, not pulled from any competitor site.
const BRAND_CATALOG = {
  'Maruti Suzuki': {
    basePrice: 650000,
    models: {
      'Alto K10': 450000, 'S-Presso': 480000, Celerio: 550000, WagonR: 550000,
      Swift: 670000, Baleno: 720000, Dzire: 700000, Ignis: 650000,
      Ertiga: 950000, XL6: 1150000, Brezza: 1100000, 'Grand Vitara': 1300000,
      Fronx: 850000, Jimny: 1350000, Eeco: 500000, Ciaz: 950000, 'S-Cross': 800000,
      // Discontinued/legacy models — still common in "sell my car" submissions
      // for older vehicles.
      800: 250000, Omni: 350000, Zen: 300000, Esteem: 380000,
      'Alto 800': 380000, Versa: 400000, 'Wagon R Duo': 420000,
    },
  },
  Hyundai: {
    basePrice: 850000,
    models: {
      'Grand i10 Nios': 600000, i20: 700000, Aura: 700000, Venue: 900000,
      Creta: 1200000, Verna: 1050000, Alcazar: 1600000, Exter: 750000,
      Tucson: 2700000, 'Venue N Line': 1150000, Eon: 300000,
    },
  },
  Tata: {
    basePrice: 800000,
    models: {
      Tiago: 580000, Tigor: 700000, Altroz: 720000, Punch: 620000,
      Nexon: 950000, Harrier: 1600000, Safari: 1800000,
      'Tigor EV': 1300000, 'Nexon EV': 1500000, 'Punch EV': 1100000,
    },
  },
  Mahindra: {
    basePrice: 1150000,
    models: {
      Bolero: 950000, 'Bolero Neo': 1000000, XUV300: 750000, XUV400: 1700000,
      'Scorpio Classic': 1400000, 'Scorpio-N': 1600000, XUV700: 2000000,
      Thar: 1350000, Marazzo: 1400000, KUV100: 550000, XUV500: 1000000,
    },
  },
  Honda: {
    basePrice: 950000, resaleTier: 'weak',
    models: {
      Amaze: 680000, City: 1120000, 'City Hybrid': 1900000, Elevate: 1300000,
      'WR-V': 780000, Jazz: 900000,
    },
  },
  Toyota: {
    basePrice: 1500000,
    models: {
      Glanza: 720000, 'Urban Cruiser Taisor': 780000, 'Innova Crysta': 2000000,
      'Innova Hycross': 2200000, Fortuner: 3600000, Hilux: 3800000,
      Camry: 4500000, Hyryder: 1400000, Rumion: 950000,
    },
  },
  Kia: {
    basePrice: 1050000,
    models: { Sonet: 900000, Seltos: 1250000, Carens: 1300000, Carnival: 3200000, EV6: 6500000 },
  },
  MG: {
    basePrice: 1300000,
    models: {
      Astor: 1250000, Hector: 1450000, 'Hector Plus': 1450000,
      'ZS EV': 2200000, 'Comet EV': 850000, Gloster: 3700000,
    },
  },
  Skoda: {
    basePrice: 1200000, resaleTier: 'weak',
    models: { Slavia: 1150000, Kushaq: 1150000, Octavia: 1500000, Superb: 2200000, Kodiaq: 2600000 },
  },
  Volkswagen: {
    basePrice: 1150000, resaleTier: 'weak',
    models: { Virtus: 1050000, Taigun: 1150000, Tiguan: 3900000, Vento: 850000, Polo: 750000 },
  },
  Renault: {
    basePrice: 600000,
    models: { Kwid: 450000, Triber: 650000, Kiger: 700000 },
  },
  Nissan: {
    basePrice: 700000, resaleTier: 'weak',
    models: { Magnite: 650000, Kicks: 1100000 },
  },
  Ford: {
    basePrice: 750000, resaleTier: 'weak',
    models: { EcoSport: 850000, Figo: 550000, Aspire: 500000, Endeavour: 3400000, Freestyle: 550000 },
  },
  Jeep: {
    basePrice: 2000000, luxury: true,
    models: { Compass: 2100000, Meridian: 3200000, Wrangler: 7000000 },
  },
  'Mercedes-Benz': {
    basePrice: 5000000, luxury: true,
    models: { 'A-Class Limousine': 4300000, 'C-Class': 6200000, 'E-Class': 7800000, GLA: 5200000, GLC: 7500000, 'S-Class': 17500000 },
  },
  BMW: {
    basePrice: 5000000, luxury: true,
    models: { '2 Series Gran Coupe': 4200000, '3 Series': 5600000, '5 Series': 7400000, X1: 4700000, X3: 7000000, X5: 9500000 },
  },
  Audi: {
    basePrice: 4800000, luxury: true,
    models: { A4: 4600000, A6: 6500000, Q3: 5100000, Q5: 6700000, Q7: 8500000 },
  },
  Volvo: {
    basePrice: 4500000, luxury: true,
    models: { XC40: 4500000, XC60: 6500000, XC90: 9500000, S90: 6200000 },
  },
  Citroen: {
    basePrice: 900000, resaleTier: 'weak',
    models: { C3: 650000, 'C3 Aircross': 1000000, 'eC3': 1300000, Basalt: 1100000 },
  },
  BYD: {
    basePrice: 2500000,
    models: { Atto3: 2500000, Seal: 4100000, 'e6': 3000000 },
  },
  'Land Rover': {
    basePrice: 7500000, luxury: true,
    models: { 'Range Rover Evoque': 6700000, 'Range Rover Velar': 8500000, 'Range Rover Sport': 14000000, Defender: 9500000 },
  },
  MINI: {
    basePrice: 4200000, luxury: true,
    models: { Cooper: 4200000, Countryman: 5000000 },
  },
  Chevrolet: {
    basePrice: 550000, resaleTier: 'weak',
    models: { Beat: 400000, Spark: 400000, Cruze: 900000, Tavera: 700000 },
  },
  Datsun: {
    basePrice: 450000, resaleTier: 'weak',
    models: { GO: 400000, 'GO+': 450000, redi_GO: 350000 },
  },
  Fiat: {
    basePrice: 600000, resaleTier: 'weak',
    models: { Punto: 550000, Linea: 650000, Avventura: 700000 },
  },
  Isuzu: {
    basePrice: 1600000, resaleTier: 'weak',
    models: { 'D-Max': 1600000, MUX: 3300000, 'V-Cross': 2000000 },
  },
};

function listBrands() {
  return Object.keys(BRAND_CATALOG).sort();
}

function listModels(brand) {
  return BRAND_CATALOG[brand] ? Object.keys(BRAND_CATALOG[brand].models).sort() : [];
}

function getBasePrice(brand, model) {
  const entry = BRAND_CATALOG[brand];
  if (!entry) return 500000;
  if (model && entry.models[model] != null) return entry.models[model];
  // Model typed but not in our list (common for discontinued/rare variants):
  // assume it's more likely an older/cheaper trim than the brand's premium
  // end, and default to that brand's cheapest known model instead of an
  // arbitrary flat "brand price" — the old behaviour here overvalued every
  // unlisted model (e.g. a scrapped-decades-ago Maruti 800) at the same
  // price as a brand-new Swift, roughly double what it's actually worth.
  const prices = Object.values(entry.models);
  return prices.length ? Math.min(...prices) : entry.basePrice;
}

// Whether a brand is in the premium/luxury tier, which depreciates much
// faster in percentage terms than mass-market cars (checked against real
// BMW X1 resale listings: ~15-16%/year, vs ~7-8%/year average for a Swift
// or Creta) — thin resale demand and high running costs push used buyers
// away from ageing luxury cars much harder than from an ageing hatchback.
// Mid-size sedans/SUVs within otherwise strong-resale brands depreciate
// meaningfully faster than that brand's small hatchbacks — confirmed via
// Cars24's own comparison data (Hyundai Verna / Maruti Ciaz: ~44-45% value
// loss at 5 years, i.e. ~55-56% retained) and the Autocar-Spinny compact-SUV
// segment average (~57% retained at 5 years, covering Creta/Seltos/Nexon-
// class cars), versus the ~70-73% a Swift or Dzire retains over the same
// period. Reusing the hatchback curve for these was overvaluing them by
// roughly 10-15 points — on a ₹10-15L car that's a ₹1L+ miss, which is
// exactly what showed up as "nearly every car is off by a lakh or more":
// sedans and mid-size SUVs are the most commonly submitted cars after
// hatchbacks. Toyota and Mahindra are deliberately left out — both have a
// specific, well-documented reputation for unusually strong resale in
// India even in these segments, so forcing them onto this curve would be
// guessing against the evidence rather than with it.
const MIDSIZE_MODELS = new Set([
  'Hyundai::Creta', 'Hyundai::Verna', 'Hyundai::Alcazar', 'Hyundai::Tucson',
  'Maruti Suzuki::Ciaz', 'Maruti Suzuki::Ertiga', 'Maruti Suzuki::XL6',
  'Maruti Suzuki::Brezza', 'Maruti Suzuki::Grand Vitara', 'Maruti Suzuki::S-Cross',
  'Tata::Nexon', 'Tata::Harrier', 'Tata::Safari', 'Tata::Nexon EV',
  'Kia::Seltos', 'Kia::Carens', 'Kia::Carnival',
]);

function isLuxuryBrand(brand) {
  return !!BRAND_CATALOG[brand]?.luxury;
}

// Resale strength tier — Indian used-car demand/parts-availability isn't
// uniform across brands even outside the luxury tier. Honda specifically
// (Autocar-Spinny used car study) retains only ~50% after 5 years vs ~70-73%
// for Maruti Swift/Dzire over the same period. Ford/Fiat/Chevrolet/Datsun
// have exited the Indian market entirely, which crashes resale demand and
// spare-parts availability; VW/Skoda/Citroen/Nissan/Isuzu carry a similar,
// if less extreme, weak-resale reputation from higher perceived running
// costs and thinner dealer networks.
function getResaleTier(brand, model) {
  if (isLuxuryBrand(brand)) return 'luxury';
  if (BRAND_CATALOG[brand]?.resaleTier === 'weak') return 'weak';
  if (model && MIDSIZE_MODELS.has(`${brand}::${model}`)) return 'midsize';
  return 'standard';
}

// Variant (trim) pricing — real factory trim names per model, not a
// generic Base/Mid/High/Top label, and not one fixed set of names reused
// across every model of a brand (a Maruti hatchback uses LXI/VXI/ZXI, but
// a Maruti SUV like Grand Vitara/Fronx/Baleno/Ciaz uses Sigma/Delta/Zeta/
// Alpha — same brand, different naming, because they're different
// platforms). Engine/powertrain is folded into the name where that's how
// the actual lineup is split (Innova Crysta's diesel-only trims vs
// Innova Hycross's petrol/hybrid split, Fortuner's 4x2/4x4 split, etc.),
// matching the example given: "Innova 2.0" / "Innova 2.4" style naming.
// Spread checked against real ex-showroom tables: Swift LXI->ZXI+ and
// Creta E->SX both independently work out to ~+38% base-to-top — so
// that ratio sets the price gap between whatever the real trim names are,
// scaled evenly across however many trims a given model actually has.
const VARIANT_SPREAD_MIN = 0.87;
const VARIANT_SPREAD_MAX = 1.20;

const VARIANT_NAMES_BY_MODEL = {
  // Maruti Suzuki
  'Maruti Suzuki::Alto K10': ['STD', 'LXI', 'VXI', 'VXI+'],
  'Maruti Suzuki::S-Presso': ['STD', 'LXI', 'VXI', 'VXI+'],
  'Maruti Suzuki::Celerio': ['LXI', 'VXI', 'ZXI', 'ZXI+'],
  'Maruti Suzuki::WagonR': ['LXI', 'VXI', 'ZXI', 'ZXI+'],
  'Maruti Suzuki::Swift': ['LXI', 'VXI', 'ZXI', 'ZXI+'],
  'Maruti Suzuki::Baleno': ['Sigma', 'Delta', 'Zeta', 'Alpha'],
  'Maruti Suzuki::Dzire': ['LXI', 'VXI', 'ZXI', 'ZXI+'],
  'Maruti Suzuki::Ignis': ['Sigma', 'Delta', 'Zeta', 'Alpha'],
  'Maruti Suzuki::Ertiga': ['LXI', 'VXI', 'ZXI', 'ZXI+'],
  'Maruti Suzuki::XL6': ['Zeta', 'Alpha', 'Alpha+'],
  'Maruti Suzuki::Brezza': ['LXI', 'VXI', 'ZXI', 'ZXI+'],
  'Maruti Suzuki::Grand Vitara': ['Sigma', 'Delta', 'Zeta', 'Alpha'],
  'Maruti Suzuki::Fronx': ['Sigma', 'Delta', 'Zeta', 'Alpha'],
  'Maruti Suzuki::Jimny': ['Zeta', 'Alpha'],
  'Maruti Suzuki::Eeco': ['STD 5-Str', '5-Str AC', '7-Str AC', 'Cargo'],
  'Maruti Suzuki::Ciaz': ['Sigma', 'Delta', 'Zeta', 'Alpha'],
  'Maruti Suzuki::S-Cross': ['Sigma', 'Delta', 'Zeta', 'Alpha'],
  'Maruti Suzuki::800': ['Std', 'DX'],
  'Maruti Suzuki::Omni': ['Std', 'DX'],
  'Maruti Suzuki::Zen': ['LX', 'VX'],
  'Maruti Suzuki::Esteem': ['LX', 'VX'],
  'Maruti Suzuki::Alto 800': ['Std', 'LXI', 'VXI'],
  'Maruti Suzuki::Versa': ['DX', 'DX2'],
  'Maruti Suzuki::Wagon R Duo': ['LX', 'VX'],

  // Hyundai
  'Hyundai::Grand i10 Nios': ['Era', 'Magna', 'Sportz', 'Asta'],
  'Hyundai::i20': ['Era', 'Magna', 'Sportz', 'Asta'],
  'Hyundai::Aura': ['Era', 'S', 'SX', 'SX(O)'],
  'Hyundai::Venue': ['E', 'S', 'SX', 'SX(O)'],
  'Hyundai::Creta': ['E', 'EX', 'S', 'SX(O)'],
  'Hyundai::Verna': ['EX', 'S', 'SX', 'SX(O)'],
  'Hyundai::Alcazar': ['Prestige', 'Platinum', 'Signature'],
  'Hyundai::Exter': ['EX', 'S', 'SX', 'SX(O)'],
  'Hyundai::Tucson': ['Platinum', 'Signature'],
  'Hyundai::Venue N Line': ['N6', 'N8'],
  'Hyundai::Eon': ['D-Lite', 'Era', 'Magna'],

  // Tata
  'Tata::Tiago': ['XE', 'XM', 'XZ', 'XZ+'],
  'Tata::Tigor': ['XE', 'XM', 'XZ', 'XZ+'],
  'Tata::Altroz': ['XE', 'XM', 'XZ', 'XZ+'],
  'Tata::Punch': ['Pure', 'Adventure', 'Accomplished', 'Creative'],
  'Tata::Nexon': ['Smart', 'Pure', 'Creative', 'Fearless'],
  'Tata::Harrier': ['Smart', 'Pure', 'Adventure', 'Fearless'],
  'Tata::Safari': ['Smart', 'Pure', 'Adventure', 'Fearless'],
  'Tata::Tigor EV': ['XE', 'XM', 'XZ+'],
  'Tata::Nexon EV': ['Creative', 'Fearless', 'Empowered'],
  'Tata::Punch EV': ['Smart', 'Creative', 'Empowered'],

  // Mahindra
  'Mahindra::Bolero': ['B4', 'B6'],
  'Mahindra::Bolero Neo': ['N4', 'N8', 'N10'],
  'Mahindra::XUV300': ['W4', 'W6', 'W8', 'W8(O)'],
  'Mahindra::XUV400': ['EC', 'EL Pro'],
  'Mahindra::Scorpio Classic': ['S', 'S11'],
  'Mahindra::Scorpio-N': ['Z2', 'Z4', 'Z6', 'Z8'],
  'Mahindra::XUV700': ['MX', 'AX3', 'AX5', 'AX7'],
  'Mahindra::Thar': ['AX', 'LX'],
  'Mahindra::Marazzo': ['M2', 'M4', 'M6', 'M8'],
  'Mahindra::KUV100': ['K2', 'K4', 'K6', 'K8'],
  'Mahindra::XUV500': ['W6', 'W8', 'W10', 'W11'],

  // Honda
  'Honda::Amaze': ['E', 'S', 'V', 'VX'],
  'Honda::City': ['SV', 'V', 'VX', 'ZX'],
  'Honda::City Hybrid': ['V', 'ZX'],
  'Honda::Elevate': ['SV', 'V', 'VX', 'ZX'],
  'Honda::WR-V': ['SV', 'VX'],
  'Honda::Jazz': ['E', 'S', 'V', 'VX'],

  // Toyota
  'Toyota::Glanza': ['E', 'S', 'G', 'V'],
  'Toyota::Urban Cruiser Taisor': ['E', 'S', 'G', 'V'],
  'Toyota::Innova Crysta': ['GX 2.4 Diesel', 'VX 2.4 Diesel', 'ZX 2.4 Diesel', 'ZX O 2.4 Diesel'],
  'Toyota::Innova Hycross': ['G 2.0 Petrol', 'GX 2.0 Petrol', 'VX 2.0 Hybrid', 'ZX 2.0 Hybrid'],
  'Toyota::Fortuner': ['2.7 4x2 MT', '2.8 4x2 AT', '2.8 4x4 AT', 'Legender'],
  'Toyota::Hilux': ['STD 4x4 MT', 'High 4x4 AT'],
  'Toyota::Camry': ['Hybrid'],
  'Toyota::Hyryder': ['E', 'S', 'G', 'V'],
  'Toyota::Rumion': ['G', 'V'],

  // Kia
  'Kia::Sonet': ['HTE', 'HTK', 'HTX', 'GTX'],
  'Kia::Seltos': ['HTE', 'HTK', 'HTX', 'GTX+'],
  'Kia::Carens': ['Premium', 'Prestige', 'Prestige+', 'Luxury'],
  'Kia::Carnival': ['Premium', 'Prestige', 'Limousine'],
  'Kia::EV6': ['GT Line'],

  // MG
  'MG::Astor': ['Style', 'Super', 'Smart', 'Sharp'],
  'MG::Hector': ['Style', 'Super', 'Smart', 'Sharp'],
  'MG::Hector Plus': ['Style', 'Super', 'Smart', 'Sharp'],
  'MG::ZS EV': ['Excite', 'Exclusive'],
  'MG::Comet EV': ['Pace', 'Play'],
  'MG::Gloster': ['Super', 'Smart', 'Sharp'],

  // Skoda
  'Skoda::Slavia': ['Active', 'Ambition', 'Style', 'Matte Edition'],
  'Skoda::Kushaq': ['Active', 'Ambition', 'Style', 'Monte Carlo'],
  'Skoda::Octavia': ['Style', 'L&K'],
  'Skoda::Superb': ['Sportline', 'L&K'],
  'Skoda::Kodiaq': ['Style', 'Sportline', 'L&K'],

  // Volkswagen
  'Volkswagen::Virtus': ['Curline', 'Comfortline', 'Highline', 'GT Line'],
  'Volkswagen::Taigun': ['Comfortline', 'Highline', 'GT Line', 'GT Plus Line'],
  'Volkswagen::Tiguan': ['Elegance'],
  'Volkswagen::Vento': ['Trendline', 'Comfortline', 'Highline'],
  'Volkswagen::Polo': ['Trendline', 'Comfortline', 'Highline', 'GT'],

  // Renault
  'Renault::Kwid': ['STD', 'RXE', 'RXL', 'Climber'],
  'Renault::Triber': ['RXE', 'RXL', 'RXZ'],
  'Renault::Kiger': ['RXE', 'RXL', 'RXT', 'RXZ'],

  // Nissan
  'Nissan::Magnite': ['XE', 'XL', 'XV', 'XV Premium'],
  'Nissan::Kicks': ['XL', 'XV', 'XV Premium'],

  // Ford (exited India)
  'Ford::EcoSport': ['Ambiente', 'Trend', 'Titanium'],
  'Ford::Figo': ['Ambiente', 'Trend', 'Titanium'],
  'Ford::Aspire': ['Ambiente', 'Trend', 'Titanium'],
  'Ford::Endeavour': ['Trend', 'Titanium', 'Titanium+'],
  'Ford::Freestyle': ['Ambiente', 'Trend', 'Titanium'],

  // Jeep
  'Jeep::Compass': ['Sport', 'Longitude', 'Limited'],
  'Jeep::Meridian': ['Longitude', 'Limited'],
  'Jeep::Wrangler': ['Rubicon'],

  // Mercedes-Benz
  'Mercedes-Benz::A-Class Limousine': ['Progressive'],
  'Mercedes-Benz::C-Class': ['Avantgarde', 'AMG Line'],
  'Mercedes-Benz::E-Class': ['Avantgarde', 'AMG Line'],
  'Mercedes-Benz::GLA': ['Progressive', 'AMG Line'],
  'Mercedes-Benz::GLC': ['Avantgarde', 'AMG Line'],
  'Mercedes-Benz::S-Class': ['AMG Line', 'Maybach'],

  // BMW
  'BMW::2 Series Gran Coupe': ['Sport Line', 'M Sport'],
  'BMW::3 Series': ['Sport', 'Luxury Line', 'M Sport'],
  'BMW::5 Series': ['Luxury Line', 'M Sport'],
  'BMW::X1': ['sDrive', 'xDrive', 'M Sport'],
  'BMW::X3': ['xLine', 'M Sport'],
  'BMW::X5': ['xLine', 'M Sport'],

  // Audi
  'Audi::A4': ['Premium', 'Premium Plus', 'Technology'],
  'Audi::A6': ['Premium Plus', 'Technology'],
  'Audi::Q3': ['Premium', 'Premium Plus', 'Technology'],
  'Audi::Q5': ['Premium Plus', 'Technology'],
  'Audi::Q7': ['Premium Plus', 'Technology'],

  // Volvo
  'Volvo::XC40': ['Momentum', 'R-Design', 'Ultimate'],
  'Volvo::XC60': ['Momentum', 'Inscription', 'R-Design'],
  'Volvo::XC90': ['Momentum', 'Inscription', 'Excellence'],
  'Volvo::S90': ['Momentum', 'Inscription'],

  // Citroen
  'Citroen::C3': ['Live', 'Feel', 'Shine'],
  'Citroen::C3 Aircross': ['Live', 'Feel', 'Shine'],
  'Citroen::eC3': ['Live', 'Feel'],
  'Citroen::Basalt': ['Plus', 'Max'],

  // BYD
  'BYD::Atto3': ['Dynamic', 'Premium', 'Superior'],
  'BYD::Seal': ['Premium', 'Performance'],
  'BYD::e6': ['Superior'],

  // Land Rover
  'Land Rover::Range Rover Evoque': ['S', 'SE', 'HSE'],
  'Land Rover::Range Rover Velar': ['S', 'SE', 'HSE'],
  'Land Rover::Range Rover Sport': ['SE', 'HSE', 'Autobiography'],
  'Land Rover::Defender': ['90', '110', '130'],

  // MINI
  'MINI::Cooper': ['Classic', 'Highgate'],
  'MINI::Countryman': ['Classic', 'Highgate'],

  // Chevrolet (exited India)
  'Chevrolet::Beat': ['PS', 'LS', 'LT'],
  'Chevrolet::Spark': ['PS', 'LS', 'LT'],
  'Chevrolet::Cruze': ['LS', 'LT', 'LTZ'],
  'Chevrolet::Tavera': ['LS', 'LT'],

  // Datsun (discontinued)
  'Datsun::GO': ['D', 'A', 'T'],
  'Datsun::GO+': ['D', 'A', 'T'],
  'Datsun::redi_GO': ['D', 'A', 'T'],

  // Fiat (exited India)
  'Fiat::Punto': ['Active', 'Dynamic', 'Emotion'],
  'Fiat::Linea': ['Active', 'Dynamic', 'Emotion'],
  'Fiat::Avventura': ['Active', 'Dynamic', 'Emotion'],

  // Isuzu
  'Isuzu::D-Max': ['S-Cab', 'Base', 'High'],
  'Isuzu::MUX': ['4x2', '4x4'],
  'Isuzu::V-Cross': ['Z', 'Z Prestige'],
};

function getVariantNames(brand, model) {
  return VARIANT_NAMES_BY_MODEL[`${brand}::${model}`] || ['Base', 'Mid', 'Top'];
}

function multiplierForIndex(i, total) {
  if (total <= 1) return 1;
  return VARIANT_SPREAD_MIN + ((VARIANT_SPREAD_MAX - VARIANT_SPREAD_MIN) * i) / (total - 1);
}

// On-road premium over ex-showroom — road tax (varies by state, roughly
// 7-20%), insurance and registration, blended into one flat figure rather
// than itemised, since this is purely a display number to help a customer
// recognise their own variant. It is NOT applied to the valuation math
// below: the depreciation curve was calibrated against real resale
// listings using the ex-showroom-equivalent price as the anchor, so
// inflating that same anchor by the on-road premium would push every
// resale quote ~12% too high across the board — reintroducing the exact
// "valuation showing ₹1 lakh+ too much" bug fixed earlier this session.
const ON_ROAD_MULTIPLIER = 1.12;

function listVariants(brand, model) {
  if (!BRAND_CATALOG[brand] || !BRAND_CATALOG[brand].models[model]) return [];
  const names = getVariantNames(brand, model);
  const basePrice = BRAND_CATALOG[brand].models[model];
  return names.map((name, i) => ({
    name,
    price: Math.round((basePrice * multiplierForIndex(i, names.length) * ON_ROAD_MULTIPLIER) / 1000) * 1000,
  }));
}

function getVariantMultiplier(brand, model, variant) {
  const names = getVariantNames(brand, model);
  const i = names.indexOf(variant);
  return i >= 0 ? multiplierForIndex(i, names.length) : 1;
}

module.exports = {
  BRAND_CATALOG, listBrands, listModels, getBasePrice, isLuxuryBrand, getResaleTier,
  listVariants, getVariantMultiplier,
};
