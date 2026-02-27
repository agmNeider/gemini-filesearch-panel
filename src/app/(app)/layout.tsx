import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (cookieStore.get('fsg_auth')?.value !== 'true') {
    redirect('/login');
  }
  return <AppShell>{children}</AppShell>;
}
