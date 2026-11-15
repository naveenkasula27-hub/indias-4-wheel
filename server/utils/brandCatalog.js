// Base ex-showroom-equivalent reference price (₹) per brand+model, used as the
// starting point for the valuation engine. Each model has its own figure
// (not just one price per brand) so a hatchback and a flagship SUV from the
// same brand don't value the same. These are independent approximate market
// reference points, not pulled from any competitor site.
const BRAND_CATALOG = {
  'Maruti Suzuki': {
    basePrice: 650000,
    models: {
      'Alto K10': 450000, 'S-Presso': 480000, Celerio: 550000, WagonR: 600000,
      Swift: 650000, Baleno: 750000, Dzire: 700000, Ignis: 650000,
      Ertiga: 950000, XL6: 1150000, Brezza: 1100000, 'Grand Vitara': 1300000,
      Fronx: 850000, Jimny: 1350000, Eeco: 500000, Ciaz: 950000,
    },
  },
  Hyundai: {
    basePrice: 850000,
    models: {
      'Grand i10 Nios': 600000, i20: 800000, Aura: 700000, Venue: 900000,
      Creta: 1200000, Verna: 1150000, Alcazar: 1600000, Exter: 750000,
      Tucson: 2700000, 'Venue N Line': 1150000,
    },
  },
  Tata: {
    basePrice: 800000,
    models: {
      Tiago: 600000, Tigor: 700000, Altroz: 750000, Punch: 700000,
      Nexon: 950000, Harrier: 1600000, Safari: 1800000,
      'Tigor EV': 1300000, 'Nexon EV': 1500000, 'Punch EV': 1100000,
    },
  },
  Mahindra: {
    basePrice: 1150000,
    models: {
      Bolero: 950000, 'Bolero Neo': 1000000, XUV300: 950000, XUV400: 1700000,
      'Scorpio Classic': 1400000, 'Scorpio-N': 1600000, XUV700: 2000000,
      Thar: 1500000, Marazzo: 1400000, KUV100: 700000,
    },
  },
  Honda: {
    basePrice: 950000,
    models: {
      Amaze: 750000, City: 1200000, 'City Hybrid': 1900000, Elevate: 1300000,
      'WR-V': 950000, Jazz: 900000,
    },
  },
  Toyota: {
    basePrice: 1500000,
    models: {
      Glanza: 750000, 'Urban Cruiser Taisor': 900000, 'Innova Crysta': 2200000,
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
      Astor: 1250000, Hector: 1600000, 'Hector Plus': 1700000,
      'ZS EV': 2200000, 'Comet EV': 850000, Gloster: 3700000,
    },
  },
  Skoda: {
    basePrice: 1200000,
    models: { Slavia: 1150000, Kushaq: 1250000, Octavia: 2700000, Superb: 4500000, Kodiaq: 4700000 },
  },
  Volkswagen: {
    basePrice: 1150000,
    models: { Virtus: 1200000, Taigun: 1250000, Tiguan: 3900000, Vento: 900000, Polo: 750000 },
  },
  Renault: {
    basePrice: 600000,
    models: { Kwid: 450000, Triber: 650000, Kiger: 700000 },
  },
  Nissan: {
    basePrice: 700000,
    models: { Magnite: 650000, Kicks: 1100000 },
  },
  Ford: {
    basePrice: 750000,
    models: { EcoSport: 850000, Figo: 650000, Aspire: 700000, Endeavour: 3400000, Freestyle: 700000 },
  },
  Jeep: {
    basePrice: 2000000,
    models: { Compass: 2100000, Meridian: 3200000, Wrangler: 7000000 },
  },
  'Mercedes-Benz': {
    basePrice: 5000000,
    models: { 'A-Class Limousine': 4300000, 'C-Class': 6200000, 'E-Class': 7800000, GLA: 5200000, GLC: 7500000, 'S-Class': 17500000 },
  },
  BMW: {
    basePrice: 5000000,
    models: { '2 Series Gran Coupe': 4200000, '3 Series': 5600000, '5 Series': 7400000, X1: 4700000, X3: 7000000, X5: 9500000 },
  },
  Audi: {
    basePrice: 4800000,
    models: { A4: 4600000, A6: 6500000, Q3: 5100000, Q5: 6700000, Q7: 8500000 },
  },
  Volvo: {
    basePrice: 4500000,
    models: { XC40: 4500000, XC60: 6500000, XC90: 9500000, S90: 6200000 },
  },
  Citroen: {
    basePrice: 900000,
    models: { C3: 650000, 'C3 Aircross': 1000000, 'eC3': 1300000, Basalt: 1100000 },
  },
  BYD: {
    basePrice: 2500000,
    models: { Atto3: 2500000, Seal: 4100000, 'e6': 3000000 },
  },
  'Land Rover': {
    basePrice: 7500000,
    models: { 'Range Rover Evoque': 6700000, 'Range Rover Velar': 8500000, 'Range Rover Sport': 14000000, Defender: 9500000 },
  },
  MINI: {
    basePrice: 4200000,
    models: { Cooper: 4200000, Countryman: 5000000 },
  },
  Chevrolet: {
    basePrice: 550000,
    models: { Beat: 450000, Spark: 400000, Cruze: 900000, Tavera: 700000 },
  },
  Datsun: {
    basePrice: 450000,
    models: { GO: 400000, 'GO+': 450000, redi_GO: 350000 },
  },
  Fiat: {
    basePrice: 600000,
    models: { Punto: 550000, Linea: 650000, Avventura: 700000 },
  },
  Isuzu: {
    basePrice: 1600000,
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
  if (!entry) return 700000;
  if (model && entry.models[model] != null) return entry.models[model];
  return entry.basePrice;
}

module.exports = { BRAND_CATALOG, listBrands, listModels, getBasePrice };
