import OwnerProfile from '../models/ownerProfileModel.js';
import Service from '../models/serviceModel.js';
import ServiceProvider from '../models/serviceProviderModel.js';
import User from '../models/userModel.js';

// @desc   Setup Business Info
// @route  POST /api/v1/services/setup
// @access Public
export const setupBusiness = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can access this' });
    }

    const { business_name, address } = req.body;

    if (!business_name || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    let profile = await OwnerProfile.findOne({ user: req.user._id });

    if (profile) {
      profile.business_name = business_name;
      profile.address = address;
      await profile.save();
    } else {
      profile = await OwnerProfile.create({
        user: req.user._id,
        business_name,
        address
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      registration_step: 'completed'
    });

    res.status(200).json({
      message: 'Business info saved',
      profile,
      next_step: 'add_services'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Add Service
// @route  POST /api/v1/services/add
// @access Private(Owner)
export const addService = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can do this' });
    }

    const { name, duration_minutes, price } = req.body;

    if (!name || !duration_minutes || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const service = await Service.create({
      owner: req.user._id,
      name,
      duration_minutes,
      price
    });

    await OwnerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $push: { services: service._id } }
    );

    res.status(201).json({ message: 'Service added', service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get All Services
// @route  GET /api/v1/services
// @access Public
export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ owner: req.user._id });

    res.status(200).json({
      count: services.length,
      services
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get Service by ID
// @route  GET /api/v1/services/:id
// @access Public
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.status(200).json({ service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Update Service
// @route  PUT /api/v1/services/:id
// @access Private(Owner)
export const updateService = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can do this' });
    }

    const service = await Service.findOne({
      _id: req.params.id,
      owner: req.user._id  
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const { name, duration_minutes, price } = req.body;

    if (name) service.name = name;
    if (duration_minutes) service.duration_minutes = duration_minutes;
    if (price) service.price = price;

    await service.save();

    res.status(200).json({ message: 'Service updated', service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Delete Service
// @route  DELETE /api/v1/services/:id
// @access Private(Owner)
export const deleteService = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can do this' });
    }

    const service = await Service.findOne({
      _id: req.params.id,
      owner: req.user._id 
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await service.deleteOne();

    await OwnerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { services: service._id } }
    );

    res.status(200).json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Add Service Provider
// @route  POST /api/v1/services/provider
// @access Private(Owner)
export const addProvider = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can do this' });
    }

    const { name, title, services } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Provider name is required' });
    }

    if (services?.length) {
      const validServices = await Service.find({
        _id: { $in: services },
        owner: req.user._id  
      });

      if (validServices.length !== services.length) {
        return res.status(400).json({ error: 'Some services are invalid' });
      }
    }

    const provider = await ServiceProvider.create({
      owner: req.user._id,
      name,
      title,
      services: services || []
    });

    await OwnerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $push: { service_providers: provider._id } }
    );

    res.status(201).json({ message: 'Provider added', provider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Update Provider
// @route  PUT /api/v1/services/provider/:id
// @access Private(Owner)
export const updateProvider = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can do this' });
    }

    const provider = await ServiceProvider.findOne({
      _id: req.params.id,
      owner: req.user._id  
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const { name, title, services } = req.body;

    if (name) provider.name = name;
    if (title) provider.title = title;

    if (services?.length) {
      const validServices = await Service.find({
        _id: { $in: services },
        owner: req.user._id
      });

      if (validServices.length !== services.length) {
        return res.status(400).json({ error: 'Some services are invalid' });
      }
      provider.services = services;
    }

    await provider.save();

    res.status(200).json({ message: 'Provider updated', provider });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Delete Provider
// @route  DELETE /api/v1/services/provider/:id
// @access  Private(Owner)
export const deleteProvider = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can do this' });
    }

    const provider = await ServiceProvider.findOne({
      _id: req.params.id,
      owner: req.user._id 
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    await provider.deleteOne();

    await OwnerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { service_providers: provider._id } }
    );

    res.status(200).json({ message: 'Provider deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// @desc   Finish Setup
// @route  POST /api/v1/services/finish
// @access Public
export const finishSetup = async (req, res) => {
  try {
    const profile = await OwnerProfile.findOne({ user: req.user._id })
      .populate('services')
      .populate('service_providers');

    if (!profile) {
      return res.status(400).json({ error: 'Complete business info first' });
    }

    if (!profile.services.length) {
      return res.status(400).json({ error: 'Add at least one service' });
    }

    if (!profile.service_providers.length) {
      return res.status(400).json({ error: 'Add at least one provider' });
    }

    profile.setup_completed = true;
    await profile.save();

    await User.findByIdAndUpdate(req.user._id, {
      registration_step: 'completed'
    });

    res.status(200).json({
      message: 'Setup complete 🎉',
      profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get Full Profile (للمراجعة)
// @route  GET /api/v1/services/profile
// @access Public
export const getProfile = async (req, res) => {
  try {
    const profile = await OwnerProfile.findOne({ user: req.user._id })
      .populate('services')
      .populate('service_providers');

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

