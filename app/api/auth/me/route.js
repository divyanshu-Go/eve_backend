import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request) {
  try {
    const decoded = authenticateRequest(request);

    await connectDB();

    const user = await User.findById(decoded.userId).select(
      "-password"
    );

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      user,
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