import mongoose from 'mongoose';
import Business from '../models/businessModel.js';

const businesses = [
  { name: 'Clinic',       name_ar: 'عيادة',       icon: 'clinic',      color: '#7C3AED' },
  { name: 'Restaurant',   name_ar: 'مطعم',         icon: 'restaurant',  color: '#1E3A5F' },
  { name: 'Bank',         name_ar: 'بنك',          icon: 'bank',        color: '#2563EB' },
  { name: 'Salon',        name_ar: 'صالون',        icon: 'salon',       color: '#BE185D' },
  { name: 'Pharmacy',     name_ar: 'صيدلية',       icon: 'pharmacy',    color: '#D97706' },
  { name: 'Gov. Service', name_ar: 'خدمة حكومية',  icon: 'gov',         color: '#059669' },
];

const seedBusinesses = async () => {
  try {
    const count = await Business.countDocuments();
    if (count > 0) {
      console.log(`⚠️  Already seeded (${count} found) — skipping`);
      return;
    }
    await Business.insertMany(businesses);
    console.log(`✅ Seeded ${businesses.length} businesses`);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
};

export default seedBusinesses;