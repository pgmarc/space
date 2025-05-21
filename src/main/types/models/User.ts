export interface LeanUser {
  id: string;
  username: string;
  password: string;
  apiKey: string;
  role: Role;
}

export type Role = 'ADMIN' | 'MANAGER' | 'EVALUATOR';
export type Module = 'users' | 'services' | 'contracts' | 'features' | '*';
export type RestOperation = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RolePermissions {
  allowAll?: boolean;
  allowedMethods?: Partial<Record<RestOperation, Module[]>>;
  blockedMethods?: Partial<Record<RestOperation, Module[]>>;
}

export const USER_ROLES: Role[] = ['ADMIN', 'MANAGER', 'EVALUATOR'];

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  'ADMIN': {
    allowAll: true
  },
  'MANAGER': {
    blockedMethods: {
      'DELETE': ['*']
    }
  },
  'EVALUATOR': {
    allowedMethods: {
      'GET': ['services', 'features'],
      'POST': ['features']
    }
  }
};