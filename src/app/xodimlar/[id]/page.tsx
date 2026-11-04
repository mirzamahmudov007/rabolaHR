import { AppShell } from '@/shared/layout/AppShell';
import { EmployeeDetails } from '@/features/employee-details/EmployeeDetails';

export default function Page({ params }: { params: { id: string }; }) {
  return (
    <AppShell>
      <EmployeeDetails id={params.id} />
    </AppShell>);

}
