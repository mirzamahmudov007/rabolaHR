/** Permission areas — each groups the actions available on one page/feature. */
export type PermGroup =
'monitoring' |
'employees' |
'branches' |
'devices' |
'payroll' |
'reports' |
'settings';

/** Actions that can be granted inside a group. */
export type PermAction = 'view' | 'add' | 'edit' | 'delete' | 'export' | 'manage';

/** Flat permission id, e.g. `employees.delete`. */
export type PermissionId = string;

/**
 * The catalog: which actions exist per area. Mirrors the real functions
 * shipped on each page — keeping it here means the UI and the future
 * backend guard list stay derived from one source.
 */
export const PERM_CATALOG: { group: PermGroup; actions: PermAction[] }[] = [
{ group: 'monitoring', actions: ['view', 'export'] },
{ group: 'employees', actions: ['view', 'add', 'edit', 'delete'] },
{ group: 'branches', actions: ['view', 'add', 'edit', 'delete'] },
{ group: 'devices', actions: ['view', 'add', 'edit', 'delete'] },
{ group: 'payroll', actions: ['view', 'edit', 'export'] },
{ group: 'reports', actions: ['view', 'export'] },
{ group: 'settings', actions: ['manage'] }];


export const ALL_PERMISSIONS: PermissionId[] = PERM_CATALOG.flatMap((c) =>
c.actions.map((a) => `${c.group}.${a}`)
);

/** Role presets offered when adding an admin; `super` is the full-access flag. */
export type AdminRoleKey = 'super' | 'hr' | 'it' | 'accountant';

export const ROLE_KEYS: AdminRoleKey[] = ['super', 'hr', 'it', 'accountant'];

export interface Admin {
  id: string;
  /** Display name — an Uzbek literal, translate via g(). */
  name: string;
  email: string;
  roleKey: AdminRoleKey;
  /** Super admin ignores the permission list entirely. */
  super: boolean;
  permissions: PermissionId[];
}
