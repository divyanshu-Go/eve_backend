import connectDB from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    return Response.json({
      success: true,
      message: "Server and database are working",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return Response.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}