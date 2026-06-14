import Booking from "../models/bookingModel.js";
import Service from "../models/serviceModel.js";
import ServiceProvider from "../models/serviceProviderModel.js";
import WorkingHours from "../models/workingHoursModel.js";
import OwnerProfile from "../models/ownerProfileModel.js";
import User from "../models/userModel.js";

const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// Helper: "09:00" → minutes
const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Helper: minutes → "09:00"
const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

// Helper: generate slots between from → to with duration
const generateSlots = (from, to, duration) => {
  const slots = [];
  let current = timeToMinutes(from);
  const end = timeToMinutes(to);
  while (current + duration <= end) {
    slots.push(minutesToTime(current));
    current += duration;
  }
  return slots;
};

// @desc   Get all owners (users with role=owner + completed setup)
// @route  GET /api/v1/bookings/owners
// @access Private (User)
export const getOwners = async (req, res) => {
  try {
    const profiles = await OwnerProfile.find({ setup_completed: true })
      .populate("user", "email phone_number business")
      .populate("services")
      .populate("service_providers");

    res.status(200).json({ count: profiles.length, owners: profiles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get owner's services
// @route  GET /api/v1/bookings/owners/:ownerId/services
// @access Private (User)
export const getOwnerServices = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const profile = await OwnerProfile.findOne({ user: ownerId })
      .populate("services")
      .populate("service_providers");

    if (!profile) {
      return res.status(404).json({ error: "Owner not found" });
    }

    res.status(200).json({
      business_name: profile.business_name,
      address: profile.address,
      services: profile.services,
      service_providers: profile.service_providers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get available slots for a provider on a date
// @route  GET /api/v1/bookings/owners/:ownerId/slots?date=2026-05-30&service_id=xxx&provider_id=xxx
// @access Private (User)
export const getAvailableSlots = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { date, service_id, provider_id } = req.query;

    if (!date || !service_id || !provider_id) {
      return res
        .status(400)
        .json({ error: "date, service_id, and provider_id are required" });
    }

    // 1. Get day name
    const dayIndex = new Date(date).getDay();
    const dayName = DAYS[dayIndex];

    // 2. Check working hours
    const workingHours = await WorkingHours.findOne({ owner: ownerId });
    if (!workingHours) {
      return res.status(404).json({ error: "Owner has no working hours set" });
    }

    const daySchedule = workingHours.schedule[dayName];
    if (!daySchedule?.is_open) {
      return res
        .status(200)
        .json({ message: "Owner is closed on this day", slots: [] });
    }

    // 3. Get service duration
    const service = await Service.findById(service_id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // 4. Generate all possible slots
    const allSlots = generateSlots(
      daySchedule.from,
      daySchedule.to,
      service.duration_minutes,
    );

    // 5. Get booked slots for this provider on this date
    const bookedSlots = await Booking.find({
      service_provider: provider_id,
      date,
      status: { $nin: ["cancelled"] },
    }).select("start_time");

    const bookedTimes = bookedSlots.map((b) => b.start_time);

    // 6. Filter available
    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot),
    );

    res.status(200).json({
      date,
      day: dayName,
      working_hours: { from: daySchedule.from, to: daySchedule.to },
      service_duration: service.duration_minutes,
      total_slots: allSlots.length,
      booked: bookedTimes.length,
      available: availableSlots.length,
      slots: availableSlots,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Create a booking
// @route  POST /api/v1/bookings
// @access Private (User)
export const createBooking = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ error: "Only users can book" });
    }

    const { owner_id, service_id, provider_id, date, start_time, notes } =
      req.body;

    if (!owner_id || !service_id || !provider_id || !date || !start_time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 1. Validate service belongs to owner
    const service = await Service.findOne({ _id: service_id, owner: owner_id });
    if (!service) {
      return res
        .status(404)
        .json({ error: "Service not found for this owner" });
    }

    // 2. Validate provider belongs to owner & offers this service
    const provider = await ServiceProvider.findOne({
      _id: provider_id,
      owner: owner_id,
      services: service_id,
    });
    if (!provider) {
      return res
        .status(404)
        .json({ error: "Provider not found or doesn't offer this service" });
    }

    // 3. Check working hours
    const dayIndex = new Date(date).getDay();
    const dayName = DAYS[dayIndex];
    const workingHours = await WorkingHours.findOne({ owner: owner_id });

    if (!workingHours?.schedule[dayName]?.is_open) {
      return res.status(400).json({ error: "Owner is closed on this day" });
    }

    // 4. Check slot is not already booked
    const conflict = await Booking.findOne({
      service_provider: provider_id,
      date,
      start_time,
      status: { $nin: ["cancelled"] },
    });

    if (conflict) {
      return res.status(409).json({ error: "This slot is already booked" });
    }

    // 5. Calculate end_time
    const end_time = minutesToTime(
      timeToMinutes(start_time) + service.duration_minutes,
    );

    // 6. Create booking
    const booking = await Booking.create({
      user: req.user._id,
      owner: owner_id,
      service: service_id,
      service_provider: provider_id,
      date,
      start_time,
      end_time,
      notes: notes || null,
    });

    await booking.populate(["service", "service_provider"]);

    res.status(201).json({ message: "Booking confirmed", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get my bookings
// @route  GET /api/v1/bookings/my
// @access Private (User)
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("service", "name price duration_minutes")
      .populate("service_provider", "name title")
      .populate("owner", "email")
      .sort({ date: 1, start_time: 1 });

    res.status(200).json({ count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Cancel a booking
// @route  PATCH /api/v1/bookings/:id/cancel
// @access Private (User)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ error: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const autoMarkMissed = async (ownerId, date) => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  await Booking.updateMany(
    {
      owner: ownerId,
      date,
      status: "waiting",
      end_time: { $lte: currentTime },
    },
    { status: "missed" }
  );
};

// @desc   Get bookings for a specific date (owner)
// @route  GET /api/v1/schedule?date=2026-05-30
// @access Private (Owner)
export const getSchedule = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ error: "Only owners can access this" });
    }

    const date = req.query.date || new Date().toISOString().split("T")[0];

    await autoMarkMissed(req.user._id, date);

    const bookings = await Booking.find({
      owner: req.user._id,
      date,
    })
      .populate("user", "phone_number")
      .populate("service", "name duration_minutes price")
      .populate("service_provider", "name title")
      .sort({ start_time: 1 });

    // count per status
    const waiting = bookings.filter((b) => b.status === "waiting").length;
    const present = bookings.filter((b) => b.status === "present").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const missed = bookings.filter((b) => b.status === "missed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    res.status(200).json({
      date,
      summary: { waiting, present, completed, missed, cancelled, total: bookings.length },
      bookings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Mark booking as present
// @route  PATCH /api/v1/schedule/:id/present
// @access Private (Owner)
export const markPresent = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ error: "Only owners can access this" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status !== "waiting") {
      return res.status(400).json({ error: `Cannot mark as present, current status: ${booking.status}` });
    }

    booking.status = "present";
    await booking.save();

    res.status(200).json({ message: "Marked as present", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Mark booking as completed (finish)
// @route  PATCH /api/v1/schedule/:id/complete
// @access Private (Owner)
export const markCompleted = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ error: "Only owners can access this" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status !== "present") {
      return res.status(400).json({ error: `Cannot finish, current status: ${booking.status}` });
    }

    booking.status = "completed";
    await booking.save();

    res.status(200).json({ message: "Booking completed", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};