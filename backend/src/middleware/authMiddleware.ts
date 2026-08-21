import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.ts";

/**
 * Express middleware that validates JWT tokens on protected routes.
 * Extracts the token from the Authorization header (Bearer <token>),
 * verifies it, and attaches the decoded user payload to req.user.
 */

// Extend Express Request type to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export type AuthenticatedUser = { id: number; email: string };

/** Verifies the app's JWT and returns only the identity fields used for authorization. */
export function verifyAccessToken(token: string | null | undefined): AuthenticatedUser | null {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as Partial<AuthenticatedUser>;
    if (!Number.isInteger(decoded.id) || typeof decoded.email !== "string") return null;
    return { id: decoded.id, email: decoded.email };
  } catch {
    return null;
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  const user = verifyAccessToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }

  req.user = user;
  next();
};
