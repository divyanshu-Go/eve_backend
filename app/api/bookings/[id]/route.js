import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const decoded = authenticateRequest(request);

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid booking ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findOne({
      _id: id,
      user: decoded.userId,
    })
      .populate("centre")
      .populate("test");

    if (!booking) {
      return Response.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      booking,
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


export async function PATCH(request, { params }) {
  try {
    const decoded = authenticateRequest(request);

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid booking ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findOne({
      _id: id,
      user: decoded.userId,
    });

    if (!booking) {
      return Response.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    if (booking.status !== "PENDING") {
      return Response.json(
        {
          success: false,
          message: `Booking cannot be cancelled when status is ${booking.status}`,
        },
        { status: 400 }
      );
    }

    booking.status = "CANCELLED";

    await booking.save();

    return Response.json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
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