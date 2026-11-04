import { AppShell } from '@/shared/layout/AppShell';
import { Employees } from '@/features/employees/Employees';

export default function Page() {
  return (
    <AppShell>
      <Employees />
    </AppShell>);

}
