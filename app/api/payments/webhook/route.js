import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import WebhookEvent from "@/models/WebhookEvent";

export async function POST(request) {
  const session = await mongoose.startSession();

  try {
    const { eventId, bookingId, transactionId, paymentStatus } =
      await request.json();

    if (!eventId || !bookingId || !transactionId || !paymentStatus) {
      return Response.json(
        {
          success: false,
          message:
            "eventId, bookingId, transactionId and paymentStatus are required",
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

    let result;

    await session.withTransaction(async () => {
      // Idempotency check
      const existingEvent = await WebhookEvent.findOne({
        eventId,
      }).session(session);

      if (existingEvent) {
        result = {
          success: true,
          message: "Webhook already processed",
          duplicate: true,
        };

        return;
      }

      // Find booking
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Check whether a payment already exists
      const existingPayment = await Payment.findOne({
        booking: booking._id,
      }).session(session);

      if (existingPayment) {
        // Same payment arriving with different information
        if (
          existingPayment.transactionId !== transactionId ||
          existingPayment.status !== paymentStatus
        ) {
          throw new Error("Payment already exists with different details");
        }

        await WebhookEvent.create(
          [
            {
              eventId,
              payment: existingPayment._id,
              status: paymentStatus,
            },
          ],
          { session }
        );

        result = {
          success: true,
          message: "Payment already exists",
          duplicate: false,
        };

        return;
      }

      // Payment amount always comes from the booking.
      const payment = await Payment.create(
        [
          {
            booking: booking._id,
            amount: booking.amount,
            status: paymentStatus,
            transactionId,
          },
        ],
        { session }
      );

      // Update booking based on payment result.
      booking.status =
        paymentStatus === "SUCCESS" ? "CONFIRMED" : "FAILED";

      await booking.save({ session });

      // Store event for idempotency.
      await WebhookEvent.create(
        [
          {
            eventId,
            payment: payment[0]._id,
            status: paymentStatus,
          },
        ],
        { session }
      );

      result = {
        success: true,
        message: "Webhook processed successfully",
        duplicate: false,
        paymentId: payment[0]._id,
        bookingStatus: booking.status,
      };
    });

    return Response.json(result);
  } catch (error) {
    console.error("Webhook error:", error);

    return Response.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
}