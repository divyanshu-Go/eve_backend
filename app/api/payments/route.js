import mongoose from "mongoose";
import crypto from "crypto";

import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import Payment from "@/models/Payment";
import { authenticateRequest } from "@/lib/auth";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

    // Payment should only be created by the webhook.
    const existingPayment = await Payment.findOne({
      booking: booking._id,
    });

    if (existingPayment) {
      return Response.json(
        {
          success: false,
          message: "Payment already exists for this booking",
        },
        { status: 409 }
      );
    }

    // Simulate payment gateway processing time.
    await wait(2000);

    // Simulate the payment provider generating these values.
    const transactionId = `txn_${crypto.randomUUID()}`;
    const eventId = `evt_${crypto.randomUUID()}`;

    // Our payment simulator calls our webhook.
    const webhookUrl = new URL(
      "/api/payments/webhook",
      request.url
    );

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId,
        bookingId: booking._id.toString(),
        transactionId,
        paymentStatus,
      }),
    });

    const webhookResult = await webhookResponse.json();

    if (!webhookResponse.ok) {
      return Response.json(
        {
          success: false,
          message: "Payment simulation failed",
          details: webhookResult,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Payment simulation completed",
      transactionId,
      paymentStatus,
      webhook: webhookResult,
    });
  } catch (error) {
    console.error("Payment simulation error:", error);

    return Response.json(
      {
        success: false,
        message: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}