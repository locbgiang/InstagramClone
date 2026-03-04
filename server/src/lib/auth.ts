import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "development-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret-key";

export const generateAccessToken = (userId: number | string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: number | string): string => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (
  token: string
): { userId: string | number } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string | number };
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (
  token: string
): { userId: string | number } | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string | number };
  } catch {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
