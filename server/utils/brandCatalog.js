// Base ex-showroom-equivalent reference price (₹) per brand+model, used as the
// starting point for the valuation engine. Figures are approximate market
// reference points for popular Indian trims, not pulled from any competitor site.
const BRAND_CATALOG = {
  'Maruti Suzuki': {
    basePrice: 650000,
    models: ['Alto K10', 'S-Presso', 'Celerio', 'WagonR', 'Swift', 'Baleno', 'Dzire', 'Ignis', 'Ertiga', 'XL6', 'Brezza', 'Grand Vitara', 'Fronx', 'Jimny', 'Eeco', 'Ciaz'],
  },
  Hyundai: {
    basePrice: 850000,
    models: ['Grand i10 Nios', 'i20', 'Aura', 'Venue', 'Creta', 'Verna', 'Alcazar', 'Exter', 'Tucson', 'Venue N Line'],
  },
  Tata: {
    basePrice: 800000,
    models: ['Tiago', 'Tigor', 'Altroz', 'Punch', 'Nexon', 'Harrier', 'Safari', 'Tigor EV', 'Nexon EV', 'Punch EV'],
  },
  Mahindra: {
    basePrice: 1150000,
    models: ['Bolero', 'Bolero Neo', 'XUV300', 'XUV400', 'Scorpio Classic', 'Scorpio-N', 'XUV700', 'Thar', 'Marazzo', 'KUV100'],
  },
  Honda: {
    basePrice: 950000,
    models: ['Amaze', 'City', 'City Hybrid', 'Elevate', 'WR-V', 'Jazz'],
  },
  Toyota: {
    basePrice: 1500000,
    models: ['Glanza', 'Urban Cruiser Taisor', 'Innova Crysta', 'Innova Hycross', 'Fortuner', 'Hilux', 'Camry', 'Hyryder', 'Rumion'],
  },
  Kia: {
    basePrice: 1050000,
    models: ['Sonet', 'Seltos', 'Carens', 'Carnival', 'EV6'],
  },
  MG: {
    basePrice: 1300000,
    models: ['Astor', 'Hector', 'Hector Plus', 'ZS EV', 'Comet EV', 'Gloster'],
  },
  Skoda: {
    basePrice: 1200000,
    models: ['Slavia', 'Kushaq', 'Octavia', 'Superb', 'Kodiaq'],
  },
  Volkswagen: {
    basePrice: 1150000,
    models: ['Virtus', 'Taigun', 'Tiguan', 'Vento', 'Polo'],
  },
  Renault: {
    basePrice: 600000,
    models: ['Kwid', 'Triber', 'Kiger'],
  },
  Nissan: {
    basePrice: 700000,
    models: ['Magnite', 'Kicks'],
  },
  Ford: {
    basePrice: 750000,
    models: ['EcoSport', 'Figo', 'Aspire', 'Endeavour', 'Freestyle'],
  },
  Jeep: {
    basePrice: 2000000,
    models: ['Compass', 'Meridian', 'Wrangler'],
  },
};

function listBrands() {
  return Object.keys(BRAND_CATALOG).sort();
}

function listModels(brand) {
  return BRAND_CATALOG[brand] ? [...BRAND_CATALOG[brand].models].sort() : [];
}

function getBasePrice(brand) {
  return BRAND_CATALOG[brand]?.basePrice || 700000;
}

module.exports = { BRAND_CATALOG, listBrands, listModels, getBasePrice };
