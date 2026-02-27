import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginPage } from '@/views/LoginPage';

export default async function Login() {
  const cookieStore = await cookies();
  if (cookieStore.get('fsg_auth')?.value === 'true') {
    redirect('/');
  }
  return <LoginPage />;
}
