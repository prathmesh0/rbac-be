import {
  AuthUser,
  LoginInput,
  RegisterInput,
  TokenPair,
} from "./auth.types.js";
import { userRepository } from "../users/user.repository.js";
import { permissionService } from "../permissions/permission.service.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  comparePassword,
  compareValue,
  hashPassword,
  hashValue,
} from "../../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";

// Replaces sanitizeUser. Expects user.roles to be populated (real role
// objects, not bare ObjectIds).
const buildAuthUser = async (user: any): Promise<AuthUser> => {
  const activeRoles = (user.roles ?? []).filter(
    (role: any) => role && role.isActive !== false,
  );

  const summary = await permissionService.getUserPermissionSummary(activeRoles);

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    roles: summary.roles,
    permissions: summary.permissions,
  };
};

const generateTokenPair = (userId: string): TokenPair => {
  const payload = {
    userId,
  };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(409, "Email is already registerd");
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      isActive: true,
    });

    const tokens = generateTokenPair(user._id.toString());
    const refreshTokenHash = await hashValue(tokens.refreshToken);

    await userRepository.updateRefreshTokenHash(
      user._id.toString(),
      refreshTokenHash,
    );

    return {
      // New user has no roles yet, so this returns roles: [], permissions: []
      user: await buildAuthUser(user),
      ...tokens,
    };
  },

  async login(data: LoginInput) {
    const user = await userRepository.findByEmailWithPassword(data.email);

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Your account has been deactivated");
    }

    const isValidPassoword = await comparePassword(
      data.password,
      user.password,
    );

    if (!isValidPassoword) {
      throw new ApiError(401, "Invalid email or password");
    }

    const tokens = generateTokenPair(user._id.toString());
    const refreshTokenHash = await hashValue(tokens.refreshToken);

    await userRepository.updateRefreshTokenHash(
      user._id.toString(),
      refreshTokenHash,
    );

    // findByEmailWithPassword doesn't populate roles, so re-fetch populated
    const populatedUser = await userRepository.findByIdPopulated(
      user._id.toString(),
    );

    return {
      user: await buildAuthUser(populatedUser),
      ...tokens,
    };
  },

  async refreshAccessToken(incomingRefreshToken: string) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh Token Missing");
    }
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(incomingRefreshToken);
    } catch (error) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await userRepository.findByIdWithRefreshToken(payload.userId);

    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const matches = await compareValue(
      incomingRefreshToken,
      user.refreshTokenHash,
    );

    if (!matches) {
      await userRepository.clearRefreshTokenHash(user._id.toString());
      throw new ApiError(
        401,
        "Refresh token reuse detected. Please log in again",
      );
    }

    const tokens = generateTokenPair(user._id.toString());
    const refreshTokenHash = await hashValue(tokens.refreshToken);

    await userRepository.updateRefreshTokenHash(
      user._id.toString(),
      refreshTokenHash,
    );

    const populatedUser = await userRepository.findByIdPopulated(
      user._id.toString(),
    );

    return {
      user: await buildAuthUser(populatedUser),
      ...tokens,
    };
  },

  async logout(userId: string) {
    await userRepository.clearRefreshTokenHash(userId);
  },

  async getCurrentUser(userId: string) {
    const user = await userRepository.findByIdPopulated(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (!user.isActive) {
      throw new ApiError(403, "Your account has been deactivated");
    }

    return buildAuthUser(user);
  },
};
