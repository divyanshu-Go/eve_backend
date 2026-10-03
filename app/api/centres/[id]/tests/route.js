import mongoose from "mongoose";
import connectDB from "@/lib/db";
import DiagnosticCentre from "@/models/DiagnosticCentre";
import DiagnosticTest from "@/models/DiagnosticTest";
import CentreTest from "@/models/CentreTest";
import { requireAdmin } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    requireAdmin(request);

    const { id } = await params;
    const { testId, price } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid centre ID",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return Response.json(
        {
          success: false,
          message: "Invalid test ID",
        },
        { status: 400 }
      );
    }

    if (price === undefined || price < 0) {
      return Response.json(
        {
          success: false,
          message: "Valid price is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const centre = await DiagnosticCentre.findById(id);
    const test = await DiagnosticTest.findById(testId);

    if (!centre) {
      return Response.json(
        {
          success: false,
          message: "Centre not found",
        },
        { status: 404 }
      );
    }

    if (!test) {
      return Response.json(
        {
          success: false,
          message: "Test not found",
        },
        { status: 404 }
      );
    }

    const existing = await CentreTest.findOne({
      centre: id,
      test: testId,
    });

    if (existing) {
      return Response.json(
        {
          success: false,
          message: "Test is already assigned to this centre",
        },
        { status: 409 }
      );
    }

    const centreTest = await CentreTest.create({
      centre: id,
      test: testId,
      price,
    });

    return Response.json(
      {
        success: true,
        centreTest,
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid centre ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const centreTests = await CentreTest.find({
      centre: id,
    })
      .populate("test")
      .populate("centre");

    return Response.json({
      success: true,
      centreTests,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to fetch centre tests",
      },
      { status: 500 }
    );
  }
}