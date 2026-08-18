import { User } from "./user.model.js";
import type { ICreateUser } from "./users.types.js";

export const userRepository = {
  async create(data: ICreateUser) {
    return User.create(data);
  },

  async findByEmail(email: string) {
    return User.findOne({ email });
  },

  async findByEmailWithPassword(email: string) {
    return User.findOne({ email }).select("+password");
  },

  async findById(userId: string) {
    return User.findById(userId);
  },

  async findByIdWithRefreshToken(userId: string) {
    return User.findById(userId).select("+refreshTokenHash");
  },

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | undefined,
  ) {
    return User.findByIdAndUpdate(
      userId,
      {
        refreshTokenHash,
      },
      {
        new: true,
      },
    );
  },
  async clearRefreshTokenHash(userId: string) {
    return User.findByIdAndUpdate(
      userId,
      { refreshTokenHash: null },
      { new: true },
    ).exec();
  },
};
