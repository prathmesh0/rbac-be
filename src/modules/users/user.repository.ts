import { User } from "./user.model.js";
import type {
  FindUsersOptions,
  ICreateUser,
  UpdateUserInput,
} from "./users.types.js";

interface UserFilter {
  $or?: Array<{
    name?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
  }>;
  isActive?: boolean;
  roles?: string;
}

const ROLE_POPULATE_FIELDS = "name code isActive";

export const userRepository = {
  async create(data: ICreateUser & { roles?: string[]; isActive?: boolean }) {
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

  async findByEmailExcludingId(email: string, excludeUserId: string) {
    return User.findOne({
      email,
      _id: {
        $ne: excludeUserId,
      },
    });
  },

  async findByIdPopulated(userId: string) {
    return User.findById(userId).populate("roles", ROLE_POPULATE_FIELDS);
  },

  async findAll(options: FindUsersOptions) {
    const { page, limit, search, isActive, roleId } = options;

    const filter: UserFilter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    if (roleId) {
      filter.roles = roleId;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find(filter)
        .populate("roles", ROLE_POPULATE_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      User.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateById(userId: string, data: UpdateUserInput) {
    return User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    })
      .populate("roles", ROLE_POPULATE_FIELDS)
      .exec();
  },

  async updateStatus(userId: string, isActive: boolean) {
    return User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true },
    ).exec();
  },

  async updateRoles(userId: string, roleIds: string[]) {
    return User.findByIdAndUpdate(
      userId,
      { roles: roleIds },
      { new: true, runValidators: true },
    )
      .populate("roles", ROLE_POPULATE_FIELDS)
      .exec();
  },

  async deleteById(userId: string) {
    return User.findByIdAndDelete(userId).exec();
  },
};
