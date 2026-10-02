import mongoose from "mongoose";
import crypto from "crypto";

import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Payment from "@/models/Payment";
import { authenticateRequest } from "@/lib/auth";

export async function POST(request) {
  try {
    const decoded = authenticateRequest(request);

    const { bookingId, paymentStatus } = await request.json();

    if (!bookingId || !paymentStatus) {
      return Response.json(
        {
          success: false,
          message: "Booking ID and payment status are required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return Response.json(
        {
          success: false,
          message: "Invalid booking ID",
        },
        { status: 400 }
      );
    }

    if (!["SUCCESS", "FAILED"].includes(paymentStatus)) {
      return Response.json(
        {
          success: false,
          message: "Payment status must be SUCCESS or FAILED",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findOne({
      _id: bookingId,
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
          message: `Payment cannot be processed for booking with status ${booking.status}`,
        },
        { status: 400 }
      );
    }

    // Prevent multiple payments for the same pending booking.
    const existingPayment = await Payment.findOne({
      booking: booking._id,
    });

    if (existingPayment) {
      return Response.json(
        {
          success: false,
          message: "Payment already exists for this booking",
          payment: existingPayment,
        },
        { status: 409 }
      );
    }

    /*
     * IMPORTANT:
     * Never use an amount supplied by the client.
     * The booking amount is the source of truth.
     */
    const amount = booking.amount;

    const transactionId = `txn_${crypto.randomUUID()}`;

    const payment = await Payment.create({
      booking: booking._id,
      amount,
      status: paymentStatus,
      transactionId,
    });

    if (paymentStatus === "SUCCESS") {
      booking.status = "CONFIRMED";
    } else {
      booking.status = "FAILED";
    }

    await booking.save();

    return Response.json(
      {
        success: true,
        message: "Payment processed successfully",
        payment,
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment error:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 401 }
    );
  }
}