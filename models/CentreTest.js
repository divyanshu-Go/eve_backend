import mongoose from "mongoose";

const centreTestSchema = new mongoose.Schema(
  {
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

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

centreTestSchema.index(
  { centre: 1, test: 1 },
  { unique: true }
);

const CentreTest =
  mongoose.models.CentreTest ||
  mongoose.model("CentreTest", centreTestSchema);

export default CentreTest;