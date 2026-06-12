import mongoose from 'mongoose';

const ownerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  business_name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  service_providers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  }],
  setup_completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const OwnerProfile = mongoose.model("OwnerProfile", ownerProfileSchema);

export default OwnerProfile;