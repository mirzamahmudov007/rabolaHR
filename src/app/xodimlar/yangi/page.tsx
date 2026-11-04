import { AppShell } from '@/shared/layout/AppShell';
import { EmployeeCreate } from '@/features/employee-create/EmployeeCreate';

export default function Page() {
  return (
    <AppShell>
      <EmployeeCreate />
    </AppShell>);

}
