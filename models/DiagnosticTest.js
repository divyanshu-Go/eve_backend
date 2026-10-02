import mongoose from "mongoose";

const diagnosticTestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const DiagnosticTest =
  mongoose.models.DiagnosticTest ||
  mongoose.model("DiagnosticTest", diagnosticTestSchema);

export default DiagnosticTest;