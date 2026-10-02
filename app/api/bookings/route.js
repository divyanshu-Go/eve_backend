import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import CentreTest from "@/models/CentreTest";
import { authenticateRequest } from "@/lib/auth";

export async function POST(request) {
  try {
    const decoded = authenticateRequest(request);

    const body = await request.json();

    const {
      centreId,
      testId,
      appointmentDateTime,
    } = body;

    if (!centreId || !testId || !appointmentDateTime) {
      return Response.json(
        {
          success: false,
          message:
            "Centre, test and appointment date/time are required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(centreId)) {
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

    const appointmentDate = new Date(appointmentDateTime);

    if (Number.isNaN(appointmentDate.getTime())) {
      return Response.json(
        {
          success: false,
          message: "Invalid appointment date/time",
        },
        { status: 400 }
      );
    }

    if (appointmentDate <= new Date()) {
      return Response.json(
        {
          success: false,
          message: "Appointment must be in the future",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the test offered at this particular centre.
    const centreTest = await CentreTest.findOne({
      centre: centreId,
      test: testId,
    });

    if (!centreTest) {
      return Response.json(
        {
          success: false,
          message: "Test is not available at this centre",
        },
        { status: 404 }
      );
    }

    // IMPORTANT:
    // Price comes from the database, not from the client.
    const amount = centreTest.price;

    const booking = await Booking.create({
      user: decoded.userId,
      centre: centreId,
      test: testId,
      appointmentDateTime: appointmentDate,
      amount,
      status: "PENDING",
    });

    return Response.json(
      {
        success: true,
        message: "Booking created successfully",
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 401 }
    );
  }
}

export async function GET(request) {
  try {
    const decoded = authenticateRequest(request);

    await connectDB();

    const bookings = await Booking.find({
      user: decoded.userId,
    })
      .populate("centre")
      .populate("test")
      .sort({ createdAt: -1 });

    return Response.json({
      success: true,
      bookings,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 401 }
    );
  }
}