// ============ SHARED CAR INVENTORY DATA — INDIA'S 4 WHEEL ============
// Used by the homepage carousel, the full inventory/browse page, and the car detail page.

const pimg = (id, w = 700) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

// Generic interior/detail shots reused across listings for the detail-page gallery
const INTERIOR_SHOTS = {
  swift: pimg('9495777'),
  maruti800: pimg('36061803'),
  luxurySeat: pimg('8443329'),
  climate: pimg('28490734'),
};

const CARS = [
  {
    id: 'creta-sx-2021',
    name: 'Hyundai Creta SX(O)',
    brand: 'Hyundai', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic',
    year: 2021, km: 28400, owners: 1, city: 'Hyderabad',
    price: 1240000, emi: 22100, badge: 'Assured', aged: false,
    photo: pimg('18218647'), interior: INTERIOR_SHOTS.climate,
  },
  {
    id: 'swift-vxi-2020',
    name: 'Maruti Suzuki Swift VXI',
    brand: 'Maruti Suzuki', bodyType: 'Hatchback', fuel: 'Petrol', transmission: 'Manual',
    year: 2020, km: 34200, owners: 2, city: 'Hyderabad',
    price: 590000, emi: 10800, badge: 'Great Price', aged: true,
    photo: pimg('17059960'), interior: INTERIOR_SHOTS.swift,
  },
  {
    id: 'nexon-xz-2022',
    name: 'Tata Nexon XZ+',
    brand: 'Tata', bodyType: 'SUV', fuel: 'Petrol', transmission: 'Manual',
    year: 2022, km: 15100, owners: 1, city: 'Bengaluru',
    price: 980000, emi: 18300, badge: 'Low KM', aged: false,
    photo: pimg('39487229'), interior: INTERIOR_SHOTS.climate,
  },
  {
    id: 'city-vx-2019',
    name: 'Honda City VX',
    brand: 'Honda', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Manual',
    year: 2019, km: 41600, owners: 2, city: 'Bengaluru',
    price: 810000, emi: 15200, badge: 'Pre-Owned', aged: true,
    photo: pimg('38883321'), interior: INTERIOR_SHOTS.climate,
  },
  {
    id: 'xuv700-ax7-2022',
    name: 'Mahindra XUV700 AX7',
    brand: 'Mahindra', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic',
    year: 2022, km: 19800, owners: 1, city: 'Mumbai',
    price: 2160000, emi: 39500, badge: 'Premium', aged: false,
    photo: pimg('15812680'), interior: INTERIOR_SHOTS.luxurySeat,
  },
  {
    id: 'tiago-xz-2021',
    name: 'Tata Tiago XZ',
    brand: 'Tata', bodyType: 'Hatchback', fuel: 'Petrol', transmission: 'Manual',
    year: 2021, km: 22300, owners: 1, city: 'Pune',
    price: 520000, emi: 9600, badge: 'Great Price', aged: true,
    photo: pimg('17720659'), interior: INTERIOR_SHOTS.swift,
  },
  {
    id: 'seltos-htx-2021',
    name: 'Kia Seltos HTX',
    brand: 'Kia', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic',
    year: 2021, km: 26700, owners: 1, city: 'Delhi NCR',
    price: 1390000, emi: 25400, badge: 'Assured', aged: false,
    photo: pimg('38715203'), interior: INTERIOR_SHOTS.climate,
  },
  {
    id: 'tigor-ev-2023',
    name: 'Tata Tigor EV XZ+',
    brand: 'Tata', bodyType: 'Electric', fuel: 'Electric', transmission: 'Automatic',
    year: 2023, km: 8900, owners: 1, city: 'Chennai',
    price: 1070000, emi: 19800, badge: 'Brand New', aged: false,
    photo: pimg('24376862'), interior: INTERIOR_SHOTS.climate,
  },
  {
    id: 'fortuner-2022',
    name: 'Toyota Fortuner 4x4',
    brand: 'Toyota', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic',
    year: 2022, km: 21500, owners: 1, city: 'Mumbai',
    price: 3450000, emi: 61200, badge: 'Premium', aged: false,
    photo: pimg('18240248'), interior: INTERIOR_SHOTS.luxurySeat,
  },
  {
    id: 'hector-2021',
    name: 'MG Hector Sharp',
    brand: 'MG', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Manual',
    year: 2021, km: 29400, owners: 2, city: 'Pune',
    price: 1480000, emi: 26900, badge: 'Assured', aged: true,
    photo: pimg('18240247'), interior: INTERIOR_SHOTS.climate,
  },
  {
    id: 'baleno-2021',
    name: 'Maruti Suzuki Baleno Delta',
    brand: 'Maruti Suzuki', bodyType: 'Hatchback', fuel: 'Petrol', transmission: 'Manual',
    year: 2021, km: 24800, owners: 1, city: 'Chennai',
    price: 640000, emi: 11700, badge: 'Low KM', aged: false,
    photo: pimg('10286399'), interior: INTERIOR_SHOTS.swift,
  },
  {
    id: 'maruti800-2005',
    name: 'Maruti 800 Std',
    brand: 'Maruti Suzuki', bodyType: 'Hatchback', fuel: 'Petrol', transmission: 'Manual',
    year: 2005, km: 68000, owners: 3, city: 'Hyderabad',
    price: 95000, emi: 2100, badge: 'Budget Pick', aged: true,
    photo: pimg('37269415'), interior: INTERIOR_SHOTS.maruti800,
  },
];

const formatPrice = (n) => n >= 100000 ? `₹ ${(n / 100000).toFixed(1)} Lakh` : `₹ ${n.toLocaleString('en-IN')}`;
const formatKm = (n) => `${n.toLocaleString('en-IN')} km`;
const formatEmi = (n) => `EMI from ₹${n.toLocaleString('en-IN')}/mo`;
const getCarById = (id) => CARS.find(c => c.id === id);
