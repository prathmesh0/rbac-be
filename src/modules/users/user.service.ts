import { ApiError } from "../../utils/ApiError.js";
import { hashPassword } from "../../utils/password.js";
import { roleRepository } from "../roles/role.repository.js";
import { userRepository } from "./user.repository.js";
import {
  CreateUserInput,
  ICreateUser,
  UpdateUserInput,
} from "./users.types.js";

const sanitize = (user: any) => {
  const { password, refreshTokenHash, ...safe } = user;
  return safe;
};

const validateRoleIds = async (roleIds: string[]) => {
  if (roleIds.length === 0) {
    return;
  }
  const results = await Promise.all(
    roleIds.map((roleId) => roleRepository.findById(roleId)),
  );
  const missingIndex = results.findIndex((role) => !role);
  if (missingIndex !== -1) {
    throw new ApiError(404, `Role with id ${roleIds[missingIndex]} not found`);
  }
};

export const userService = {
  async create(data: CreateUserInput) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(409, `User with email ${data.email} already exists`);
    }

    if (data.roles?.length) {
      await validateRoleIds(data.roles);
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      roles: data.roles ?? [],
      isActive: data.isActive ?? true,
    });
    const populated = await userRepository.findByIdPopulated(
      user._id.toString(),
    );
    return sanitize(populated!.toObject());
  },

  async getAll(options: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    roleId?: string;
  }) {
    const result = await userRepository.findAll(options);

    return {
      ...result,
      items: result.items.map((item: any) => sanitize(item)),
    };
  },

  async getById(userId: string) {
    const user = await userRepository.findByIdPopulated(userId);

    if (!user) {
      throw new ApiError(404, `User with id ${userId} not found`);
    }

    return sanitize(user.toObject());
  },

  async update(userId: string, data: UpdateUserInput) {
    const existingUser = await userRepository.findById(userId);

    if (!existingUser) {
      throw new ApiError(404, `User with id ${userId} not found`);
    }

    if (data.email) {
      const duplicate = await userRepository.findByEmailExcludingId(
        data.email,
        userId,
      );

      if (duplicate) {
        throw new ApiError(409, `Email "${data.email}" is already in use`);
      }
    }

    const updatedUser = await userRepository.updateById(userId, data);

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return sanitize(updatedUser.toObject());
  },

  async updateStatus(userId: string, isActive: boolean, actorId: string) {
    if (userId === actorId && !isActive) {
      throw new ApiError(400, "You cannot deactivate your own account");
    }

    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new ApiError(404, `User with id ${userId} not found`);
    }

    // TODO (Phase 6/7 - Permissions/Authorization): once role -> permission
    // resolution exists, also block deactivating the last active user who
    // holds a SUPER_ADMIN-equivalent role, so the system can never be left
    // with zero usable admins. Can't be checked yet - we don't know which
    // role "means" admin until Permissions exist.
    const updatedUser = await userRepository.updateStatus(userId, isActive);

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return sanitize(updatedUser);
  },

  async assignRoles(userId: string, roleIds: string[]) {
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new ApiError(404, `User with id ${userId} not found`);
    }

    await validateRoleIds(roleIds);

    const updatedUser = await userRepository.updateRoles(userId, roleIds);

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return sanitize(updatedUser.toObject());
  },

  async remove(userId: string, actorId: string) {
    if (userId === actorId) {
      throw new ApiError(400, "You cannot delete your own account");
    }

    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    // TODO (Phase 6/7): same rationale as updateStatus above - block
    // deleting the last user holding a SUPER_ADMIN-equivalent role once
    // permission resolution exists.
    await userRepository.deleteById(userId);

    return null;
  },
};
