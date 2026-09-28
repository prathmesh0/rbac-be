export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserRole {
  id: string;
  name: string;
  code: string;
}

export interface AuthUserPermission {
  module: {
    id: string;
    name: string;
    code: string;
    path?: string;
    icon?: string;
  };
  actions: string[];
}

// Phase 8 shape: base profile + active roles + the merged, module-wise
// permission summary. Returned by register/login/refresh/me so the
// frontend always has a consistent, ready-to-use payload.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: AuthUserRole[];
  permissions: AuthUserPermission[];
}
