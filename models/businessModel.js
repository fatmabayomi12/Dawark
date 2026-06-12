import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  name_ar: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Business = mongoose.model('Business', businessSchema);

export default Business;