import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import WebhookEvent from "@/models/WebhookEvent";

export async function POST(request) {
  try {
    const { eventId, transactionId, status } = await request.json();

    // Basic validation
    if (!eventId || !transactionId || !status) {
      return Response.json(
        {
          success: false,
          message: "eventId, transactionId and status are required",
        },
        { status: 400 }
      );
    }

    if (!["SUCCESS", "FAILED"].includes(status)) {
      return Response.json(
        {
          success: false,
          message: "Status must be SUCCESS or FAILED",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check idempotency
    const existingEvent = await WebhookEvent.findOne({ eventId });

    if (existingEvent) {
      return Response.json({
        success: true,
        message: "Webhook already processed",
        duplicate: true,
      });
    }

    // Find payment using transaction ID
    const payment = await Payment.findOne({ transactionId });

    if (!payment) {
      return Response.json(
        {
          success: false,
          message: "Payment not found",
        },
        { status: 404 }
      );
    }

    // Find associated booking
    const booking = await Booking.findById(payment.booking);

    if (!booking) {
      return Response.json(
        {
          success: false,
          message: "Associated booking not found",
        },
        { status: 404 }
      );
    }

    // Payment already has a different final status
    if (payment.status !== status) {
      return Response.json(
        {
          success: false,
          message: "Payment status conflict",
        },
        { status: 409 }
      );
    }

    // Make sure booking status matches payment status
    const expectedBookingStatus =
      status === "SUCCESS" ? "CONFIRMED" : "FAILED";

    if (booking.status !== expectedBookingStatus) {
      booking.status = expectedBookingStatus;
      await booking.save();
    }

    // Store webhook event
    await WebhookEvent.create({
      eventId,
      payment: payment._id,
      status,
    });

    return Response.json({
      success: true,
      message: "Webhook processed successfully",
      duplicate: false,
    });
  } catch (error) {
    console.error("Webhook error:", error);

    // Handle duplicate event race condition
    if (error.code === 11000) {
      return Response.json({
        success: true,
        message: "Webhook already processed",
        duplicate: true,
      });
    }

    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}