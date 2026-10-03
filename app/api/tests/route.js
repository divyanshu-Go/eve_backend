import connectDB from "@/lib/db";
import DiagnosticTest from "@/models/DiagnosticTest";
import { requireAdmin } from "@/lib/auth";

export async function POST(request) {
  try {
    requireAdmin(request);

    const { name, description } = await request.json();

    if (!name) {
      return Response.json(
        {
          success: false,
          message: "Test name is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const test = await DiagnosticTest.create({
      name,
      description,
    });

    return Response.json(
      {
        success: true,
        test,
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

    const tests = await DiagnosticTest.find().sort({
      createdAt: -1,
    });

    return Response.json({
      success: true,
      tests,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to fetch tests",
      },
      { status: 500 }
    );
  }
}