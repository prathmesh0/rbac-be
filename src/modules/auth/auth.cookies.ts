import type { CookieOptions } from "express";
import { env } from "../../config/env.js";

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
export const refreshTokenCookieOption: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/api/v1/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const clearRefreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",

  sameSite: env.NODE_ENV === "production" ? "strict" : "lax",

  path: "/api/v1/auth",
};
