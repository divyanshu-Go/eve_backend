import mongoose from "mongoose";

const diagnosticCentreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const DiagnosticCentre =
  mongoose.models.DiagnosticCentre ||
  mongoose.model("DiagnosticCentre", diagnosticCentreSchema);

export default DiagnosticCentre;