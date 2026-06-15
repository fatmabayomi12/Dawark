import Booking from "../models/bookingModel.js";

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