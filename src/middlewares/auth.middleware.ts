import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { userRepository } from "../modules/users/user.repository.js";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError(401, "Access token is required");
    }
    const accessToken = authorization.substring(7).trim();
    if (!accessToken) {
      throw new ApiError(401, "Access token is required");
    }

    let payload: { userId: string };
    try {
      payload = verifyAccessToken(accessToken);
    } catch (error) {
      throw new ApiError(401, "Invalid or expired access token");
    }
    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Your account has been deactivated");
    }

    req.user = {
      id: user._id.toString(),
      roles: user.roles.map((roleId) => roleId.toString()),
    };
    next();
  } catch (error) {
    next(error);
  }
};
