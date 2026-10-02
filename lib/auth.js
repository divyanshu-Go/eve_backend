import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
}

export function authenticateRequest(request) {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    return verifyToken(token);
  } catch {
    throw new Error("Invalid or expired token");
  }
}


export function requireAdmin(request) {
  const decoded = authenticateRequest(request);

  if (decoded.role !== "ADMIN") {
    throw new Error("Admin access required");
  }

  return decoded;
}