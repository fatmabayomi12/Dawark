import WorkingHours from "../models/workingHoursModel.js";
import OwnerProfile from "../models/ownerProfileModel.js";

const VALID_DAYS = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

// Helper: validate time format "HH:MM"
const isValidTime = (time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

// @desc   Set or Update Working Hours
// @route  POST /api/v1/working-hours
// @access Private (Owner)
export const setWorkingHours = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ error: "Only owners can do this" });
    }

    const { schedule } = req.body;

    if (!schedule || typeof schedule !== "object") {
      return res.status(400).json({ error: "Schedule is required" });
    }

    // Validate each day
    for (const day of Object.keys(schedule)) {
      if (!VALID_DAYS.includes(day)) {
        return res.status(400).json({ error: `Invalid day: ${day}` });
      }

      const { is_open, from, to } = schedule[day];

      if (is_open) {
        if (!from || !to) {
          return res.status(400).json({
            error: `${day}: from and to are required when is_open is true`,
          });
        }
        if (!isValidTime(from) || !isValidTime(to)) {
          return res.status(400).json({
            error: `${day}: Invalid time format, use HH:MM`,
          });
        }
        if (from >= to) {
          return res.status(400).json({
            error: `${day}: 'from' must be before 'to'`,
          });
        }
      }
    }

    // Upsert
    const workingHours = await WorkingHours.findOneAndUpdate(
      { owner: req.user._id },
      { schedule },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      message: "Working hours saved",
      working_hours: workingHours,
      next_step: "setup_complete",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get Working Hours
// @route  GET /api/v1/working-hours
// @access Private (Owner)
export const getWorkingHours = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ error: "Only owners can do this" });
    }

    const workingHours = await WorkingHours.findOne({
      owner: req.user._id,
    }).populate("owner", "email phone_number role"); // من User

    if (!workingHours) {
      return res.status(404).json({ error: "Working hours not set yet" });
    }

    const profile = await OwnerProfile.findOne({ user: req.user._id }).select(
      "business_name address",
    );

    res.status(200).json({
      working_hours: {
        ...workingHours.toObject(),
        owner: {
          ...workingHours.owner.toObject(),
          business_name: profile?.business_name,
          address: profile?.address,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Update Single Day
// @route  PATCH /api/v1/working-hours/:day
// @access Private (Owner)
export const updateDaySchedule = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ error: "Only owners can do this" });
    }

    const { day } = req.params;

    if (!VALID_DAYS.includes(day)) {
      return res.status(400).json({ error: `Invalid day: ${day}` });
    }

    const { is_open, from, to } = req.body;

    if (is_open) {
      if (!from || !to) {
        return res.status(400).json({
          error: "from and to are required when is_open is true",
        });
      }
      if (!isValidTime(from) || !isValidTime(to)) {
        return res
          .status(400)
          .json({ error: "Invalid time format, use HH:MM" });
      }
      if (from >= to) {
        return res.status(400).json({ error: "'from' must be before 'to'" });
      }
    }

    const workingHours = await WorkingHours.findOneAndUpdate(
      { owner: req.user._id },
      {
        $set: {
          [`schedule.${day}`]: { is_open: is_open ?? false, from, to },
        },
      },
      { new: true, upsert: true },
    );

    res.status(200).json({
      message: `${day} updated`,
      working_hours: workingHours,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
