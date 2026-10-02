import connectDB from "@/lib/db";
import DiagnosticCentre from "@/models/DiagnosticCentre";
import { requireAdmin } from "@/lib/auth";

export async function POST(request) {
  try {
    requireAdmin(request);

    const { name, location } = await request.json();

    if (!name || !location) {
      return Response.json(
        {
          success: false,
          message: "Name and location are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const centre = await DiagnosticCentre.create({
      name,
      location,
    });

    return Response.json(
      {
        success: true,
        centre,
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: error.message === "Admin access required" ? 403 : 401 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const centres = await DiagnosticCentre.find().sort({
      createdAt: -1,
    });

    return Response.json({
      success: true,
      centres,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to fetch centres",
      },
      { status: 500 }
    );
  }
}