import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authService } from "./auth.service.js";
import {
  clearRefreshTokenCookieOptions,
  refreshTokenCookieOption,
  REFRESH_TOKEN_COOKIE_NAME,
} from "./auth.cookies.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    result.refreshToken,
    refreshTokenCookieOption,
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "User registered successfully",
    ),
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    result.refreshToken,
    refreshTokenCookieOption,
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Login successful",
    ),
  );
});

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const incomingRefreshToken = req?.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    const result = await authService.refreshAccessToken(incomingRefreshToken);

    res.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      result.refreshToken,
      refreshTokenCookieOption,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        "Access token refreshed",
      ),
    );
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user.userId);
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, clearRefreshTokenCookieOptions);

  return res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user.userId);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched"));
});
