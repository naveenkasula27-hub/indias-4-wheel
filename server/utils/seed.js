require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../db');
const Admin = require('../models/Admin');
const Car = require('../models/Car');

function pimg(id, w = 700) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}

const SAMPLE_CARS = [
  { name: 'Hyundai Creta SX(O)', brand: 'Hyundai', model: 'Creta', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic', year: 2021, km: 28400, owners: 1, city: 'Mumbai', price: 1240000, emi: 22100, badge: 'Great Price', aged: false, photo: pimg('18944215') },
  { name: 'Maruti Suzuki Swift VXI', brand: 'Maruti Suzuki', model: 'Swift', bodyType: 'Hatchback', fuel: 'Petrol', transmission: 'Manual', year: 2020, km: 34200, owners: 1, city: 'Pune', price: 590000, emi: 10800, badge: 'Low KM', aged: true, photo: pimg('1545743') },
  { name: 'Tata Nexon XZ+', brand: 'Tata', model: 'Nexon', bodyType: 'SUV', fuel: 'Petrol', transmission: 'Manual', year: 2022, km: 15100, owners: 1, city: 'Bengaluru', price: 980000, emi: 18300, badge: 'Pre-Owned', aged: false, photo: pimg('2676096') },
  { name: 'Honda City VX', brand: 'Honda', model: 'City', bodyType: 'Sedan', fuel: 'Petrol', transmission: 'Manual', year: 2019, km: 41600, owners: 2, city: 'Chennai', price: 810000, emi: 15200, badge: 'Premium', aged: true, photo: pimg('1104768') },
  { name: 'Mahindra XUV700 AX7', brand: 'Mahindra', model: 'XUV700', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic', year: 2022, km: 19800, owners: 1, city: 'Mumbai', price: 2160000, emi: 39500, badge: 'Premium', aged: false, photo: pimg('15812680') },
  { name: 'Tata Tiago XZ', brand: 'Tata', model: 'Tiago', bodyType: 'Hatchback', fuel: 'Petrol', transmission: 'Manual', year: 2021, km: 22300, owners: 1, city: 'Delhi NCR', price: 520000, emi: 9600, badge: 'Great Price', aged: true },
  { name: 'Kia Seltos HTX', brand: 'Kia', model: 'Seltos', bodyType: 'SUV', fuel: 'Diesel', transmission: 'Automatic', year: 2021, km: 26700, owners: 1, city: 'Hyderabad', price: 1390000, emi: 25400, badge: 'Assured', aged: false },
  { name: 'Tata Tigor EV XZ+', brand: 'Tata', model: 'Tigor EV', bodyType: 'Electric', fuel: 'Electric', transmission: 'Automatic', year: 2023, km: 8900, owners: 1, city: 'Bengaluru', price: 1070000, emi: 19800, badge: 'Brand New', aged: false },
];

async function run() {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'owner@indias4wheel.com').toLowerCase();
  const existing = await Admin.findOne({ email });
  if (!existing) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeThisPassword123', 10);
    await Admin.create({ email, passwordHash, name: 'Owner' });
    console.log(`Admin created: ${email}`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  const count = await Car.countDocuments();
  if (count === 0) {
    await Car.insertMany(SAMPLE_CARS);
    console.log(`Seeded ${SAMPLE_CARS.length} cars.`);
  } else {
    console.log('Cars already exist, skipping seed.');
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
