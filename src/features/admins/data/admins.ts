import type { Admin } from '@/features/admins/types';

/**
 * Mock admin list. Names are Uzbek literals (they go through g());
 * emails stay as-is in every locale. Permission sets follow the roles
 * a real deployment would hand out.
 */
export const admins: Admin[] = [
{
  id: 'ad-1',
  name: 'Gayratjon Mirzamahmudov',
  email: 'gayratjon@rabola.uz',
  roleKey: 'super',
  super: true,
  permissions: []
},
{
  id: 'ad-2',
  name: 'Nodira Ismoilova',
  email: 'nodira.ismoilova@rabola.uz',
  roleKey: 'hr',
  super: false,
  permissions: [
    'monitoring.view',
    'employees.view', 'employees.add', 'employees.edit', 'employees.delete',
    'branches.view',
    'reports.view', 'reports.export']

},
{
  id: 'ad-3',
  name: 'Shoxrux Qodirov',
  email: 'shoxrux.qodirov@rabola.uz',
  roleKey: 'it',
  super: false,
  permissions: [
    'monitoring.view', 'monitoring.export',
    'devices.view', 'devices.add', 'devices.edit', 'devices.delete',
    'branches.view',
    'employees.view']

},
{
  id: 'ad-4',
  name: 'Dilnoza Berdiyeva',
  email: 'dilnoza.berdiyeva@rabola.uz',
  roleKey: 'accountant',
  super: false,
  permissions: [
    'payroll.view', 'payroll.edit', 'payroll.export',
    'reports.view', 'reports.export',
    'employees.view']

}];
