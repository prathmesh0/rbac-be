// Single source of truth for the role code that gets implicit full access.
// Used by the seed script (to create the role) and by the permission
// service / future authorize() middleware (to bypass permission lookups).
export const SUPER_ADMIN_ROLE_CODE = "SUPER_ADMIN";
