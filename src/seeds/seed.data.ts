// Pure data - no logic. The seed runner (seed.ts) reads this and writes it
// to MongoDB. The running app never reads this file; after seeding, the
// app reads these records from the database like any other data.

export const ACTIONS = [
  { code: "CREATE", name: "Create", description: "Create new records" },
  { code: "READ", name: "Read", description: "View records" },
  { code: "UPDATE", name: "Update", description: "Edit existing records" },
  { code: "DELETE", name: "Delete", description: "Delete records" },
  { code: "EXPORT", name: "Export", description: "Export data to a file" },
  { code: "APPROVE", name: "Approve", description: "Approve pending items" },
];

// Order matters: a module with a parentCode must come AFTER its parent,
// because the parent's _id has to exist before the child can reference it.
export const MODULES: Array<{
  code: string;
  name: string;
  description?: string;
  path: string;
  icon: string;
  order: number;
  parentCode?: string;
}> = [
  {
    code: "DASHBOARD",
    name: "Dashboard",
    description: "Main landing dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    order: 1,
  },
  {
    code: "ANALYTICS",
    name: "Analytics",
    description: "Reports and charts",
    path: "/dashboard/analytics",
    icon: "BarChart",
    order: 1,
    parentCode: "DASHBOARD",
  },
  {
    code: "PROFILE",
    name: "Profile",
    description: "Own profile page",
    path: "/profile",
    icon: "User",
    order: 2,
  },
  {
    code: "USER",
    name: "Users",
    description: "User management",
    path: "/users",
    icon: "Users",
    order: 3,
  },
  {
    code: "ROLE",
    name: "Roles",
    description: "Role management",
    path: "/roles",
    icon: "Shield",
    order: 4,
  },
  {
    code: "MODULE",
    name: "Modules",
    description: "Module management",
    path: "/modules",
    icon: "LayoutGrid",
    order: 5,
  },
  {
    code: "ACTION",
    name: "Actions",
    description: "Action management",
    path: "/actions",
    icon: "Zap",
    order: 6,
  },
  {
    code: "PERMISSION",
    name: "Permissions",
    description: "Permission management",
    path: "/permissions",
    icon: "KeyRound",
    order: 7,
  },
  {
    code: "SETTINGS",
    name: "Settings",
    description: "Application settings",
    path: "/settings",
    icon: "Settings",
    order: 8,
  },
];

export const ROLES = [
  {
    code: "SUPER_ADMIN",
    name: "Super Admin",
    description: "Implicit full access to every module and action",
    isSystemRole: true,
  },
  {
    code: "ADMIN",
    name: "Admin",
    description: "Manages users and day-to-day configuration",
    isSystemRole: false,
  },
  {
    code: "MANAGER",
    name: "Manager",
    description: "Read access to reports plus own profile",
    isSystemRole: false,
  },
  {
    code: "VIEWER",
    name: "Viewer",
    description: "Read-only access",
    isSystemRole: false,
  },
];

// roleCode -> moduleCode -> actionCodes.
// SUPER_ADMIN is deliberately absent: its access is computed dynamically
// (all active modules x all active actions), so it never needs rows here.
export const ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  ADMIN: {
    DASHBOARD: ["READ"],
    ANALYTICS: ["READ", "EXPORT"],
    PROFILE: ["READ", "UPDATE"],
    USER: ["CREATE", "READ", "UPDATE", "DELETE"],
    ROLE: ["READ"],
    SETTINGS: ["READ", "UPDATE"],
  },
  MANAGER: {
    DASHBOARD: ["READ"],
    ANALYTICS: ["READ"],
    PROFILE: ["READ", "UPDATE"],
    USER: ["READ"],
  },
  VIEWER: {
    DASHBOARD: ["READ"],
    PROFILE: ["READ"],
  },
};

// Demo/dev users only. Skipped in production unless SEED_DEMO_USERS=true.
// The super admin is NOT listed here - it comes from environment variables.
export const DEMO_USERS = [
  { name: "Demo Admin", email: "admin@example.com", roleCode: "ADMIN" },
  { name: "Demo Manager", email: "manager@example.com", roleCode: "MANAGER" },
  { name: "Demo Viewer", email: "viewer@example.com", roleCode: "VIEWER" },
];
