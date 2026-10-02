import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    centre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiagnosticCentre",
      required: true,
    },

    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiagnosticTest",
      required: true,
    },

    appointmentDateTime: {
      type: Date,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);

export default Booking;