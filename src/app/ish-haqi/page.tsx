import { AppShell } from '@/shared/layout/AppShell';
import { Payroll } from '@/features/payroll/Payroll';

export default function Page() {
  return (
    <AppShell>
      <Payroll />
    </AppShell>);

}
