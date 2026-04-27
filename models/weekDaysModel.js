import mongoose from "mongoose";

const weekDaysSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      // required: true,
    },
    schedule: [
      {
        day: {
          type: String,
          enum: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
          required: [true, "Day is required"],
        },
        isOpen: {
          type: Boolean,
          default: true,
        },
        open: String,
        close: String,
      },
    ],
  },
  { timestamps: true },
);

weekDaysSchema.pre(/^find/, function () {
  this.populate({path: "business", select: "businessName"})
})

const WeekDays = mongoose.model("WeekDays", weekDaysSchema);

export default WeekDays;
