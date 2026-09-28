import mongoose from "mongoose";
import { env } from "../config/env.js"; // ADJUST if your env file/keys differ
import { Action } from "../modules/actions/action.model.js";
import { Module } from "../modules/modules/module.model.js"; // ADJUST folder name if different
import { Role } from "../modules/roles/role.model.js";
import { Permission } from "../modules/permissions/permission.model.js";
import { User } from "../modules/users/user.model.js";
import { hashPassword } from "../utils/password.js";
import { SUPER_ADMIN_ROLE_CODE } from "../constants/rbac.constants.js";
import {
  ACTIONS,
  DEMO_USERS,
  MODULES,
  ROLE_PERMISSIONS,
  ROLES,
} from "./seed.data.js";

const log = (message: string) => console.log(`[seed] ${message}`);

// Every seeder follows the same idempotent pattern: look the record up by
// its natural key (code / email); create it only if missing; NEVER touch
// an existing one. That's what makes re-running the script safe, and it
// means edits made later through the API are not overwritten.

const seedActions = async () => {
  const idByCode = new Map<string, string>();
  let created = 0;

  for (const action of ACTIONS) {
    let doc = await Action.findOne({ code: action.code });
    if (!doc) {
      doc = await Action.create({ ...action, isActive: true });
      created++;
    }
    idByCode.set(action.code, doc._id.toString());
  }

  log(
    `Actions:     ${created} created, ${ACTIONS.length - created} already existed`,
  );
  return idByCode;
};

const seedModules = async () => {
  const idByCode = new Map<string, string>();
  let created = 0;

  for (const mod of MODULES) {
    let parentModuleId: string | null = null;

    if (mod.parentCode) {
      parentModuleId = idByCode.get(mod.parentCode) ?? null;
      if (!parentModuleId) {
        throw new Error(
          `Module ${mod.code}: parent ${mod.parentCode} must be listed before it in seed.data.ts`,
        );
      }
    }

    let doc = await Module.findOne({ code: mod.code });
    if (!doc) {
      doc = await Module.create({
        code: mod.code,
        name: mod.name,
        description: mod.description,
        path: mod.path,
        icon: mod.icon,
        order: mod.order,
        parentModuleId,
        isActive: true,
      });
      created++;
    }
    idByCode.set(mod.code, doc._id.toString());
  }

  log(
    `Modules:     ${created} created, ${MODULES.length - created} already existed`,
  );
  return idByCode;
};

const seedRoles = async () => {
  const idByCode = new Map<string, string>();
  let created = 0;

  for (const role of ROLES) {
    let doc = await Role.findOne({ code: role.code });
    if (!doc) {
      doc = await Role.create({ ...role, isActive: true });
      created++;
    }
    idByCode.set(role.code, doc._id.toString());
  }

  log(
    `Roles:       ${created} created, ${ROLES.length - created} already existed`,
  );
  return idByCode;
};

const seedPermissions = async (
  roleIds: Map<string, string>,
  moduleIds: Map<string, string>,
  actionIds: Map<string, string>,
) => {
  let created = 0;
  let total = 0;

  for (const [roleCode, grants] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleIds.get(roleCode);
    if (!roleId)
      throw new Error(`Unknown role "${roleCode}" in ROLE_PERMISSIONS`);

    for (const [moduleCode, actionCodes] of Object.entries(grants)) {
      const moduleId = moduleIds.get(moduleCode);
      if (!moduleId) {
        throw new Error(`Unknown module "${moduleCode}" for role ${roleCode}`);
      }

      // Fail loudly on typos like "REED" instead of silently skipping.
      const resolvedActionIds = actionCodes.map((code) => {
        const id = actionIds.get(code);
        if (!id)
          throw new Error(
            `Unknown action "${code}" for ${roleCode}/${moduleCode}`,
          );
        return id;
      });

      total++;
      const existing = await Permission.findOne({ roleId, moduleId });
      if (!existing) {
        await Permission.create({
          roleId,
          moduleId,
          actionIds: resolvedActionIds,
        });
        created++;
      }
    }
  }

  log(`Permissions: ${created} created, ${total - created} already existed`);
};

// Creates the user if missing. Existing users are left untouched (password,
// name, etc.) - except when ensureRole is true, which re-attaches the
// expected role. Used for the super admin so it can never end up role-less.
const seedUser = async (
  user: { name: string; email: string; password: string; roleCode: string },
  roleIds: Map<string, string>,
  ensureRole: boolean,
) => {
  const roleId = roleIds.get(user.roleCode);
  if (!roleId)
    throw new Error(`Unknown role "${user.roleCode}" for ${user.email}`);

  const existing = await User.findOne({ email: user.email });
  if (existing) {
    if (ensureRole) {
      await User.updateOne(
        { _id: existing._id },
        { $addToSet: { roles: roleId } },
      );
    }
    return false;
  }

  await User.create({
    name: user.name,
    email: user.email,
    password: await hashPassword(user.password),
    roles: [roleId],
    isActive: true,
  });
  return true;
};

const getSuperAdminCredentials = () => {
  const name = process.env.SEED_SUPER_ADMIN_NAME ?? "Super Admin";
  const email = (
    process.env.SEED_SUPER_ADMIN_EMAIL ?? "superadmin@example.com"
  ).toLowerCase();
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;

  if (!password) {
    if (env.NODE_ENV === "production") {
      // Never fall back to a known default password in production.
      throw new Error(
        "SEED_SUPER_ADMIN_PASSWORD must be set when seeding in production",
      );
    }
    log(
      "SEED_SUPER_ADMIN_PASSWORD not set - using dev default 'SuperAdmin@123'",
    );
    return { name, email, password: "SuperAdmin@123" };
  }

  return { name, email, password };
};

const seedUsers = async (roleIds: Map<string, string>) => {
  let created = 0;
  let total = 0;

  // 1) Super admin - essential data, seeded in every environment.
  const superAdmin = getSuperAdminCredentials();
  total++;
  if (
    await seedUser(
      { ...superAdmin, roleCode: SUPER_ADMIN_ROLE_CODE },
      roleIds,
      true,
    )
  ) {
    created++;
  }

  // 2) Demo users - dev/test only, unless explicitly enabled.
  const seedDemo =
    env.NODE_ENV !== "production" || process.env.SEED_DEMO_USERS === "true";

  if (seedDemo) {
    const demoPassword = process.env.SEED_DEMO_PASSWORD ?? "Password@123";
    for (const demo of DEMO_USERS) {
      total++;
      if (await seedUser({ ...demo, password: demoPassword }, roleIds, false)) {
        created++;
      }
    }
  } else {
    log(
      "Production detected - skipping demo users (set SEED_DEMO_USERS=true to force)",
    );
  }

  log(`Users:       ${created} created, ${total - created} already existed`);
};

const run = async () => {
  // ADJUST: use whatever key your env.ts exposes for the Mongo connection string.
  await mongoose.connect(env.MONGODB_URI);
  log("Connected to MongoDB");

  try {
    // Order matters: permissions need role/module/action ids, and users need role ids.
    const actionIds = await seedActions();
    const moduleIds = await seedModules();
    const roleIds = await seedRoles();
    await seedPermissions(roleIds, moduleIds, actionIds);
    await seedUsers(roleIds);
    log("Seeding complete");
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});
