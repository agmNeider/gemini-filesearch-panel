const COOKIE = 'fsg_auth';

export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes(`${COOKIE}=true`);
}

export async function login(username: string, password: string): Promise<boolean> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.ok;
}

export function logout(): void {
  document.cookie = `${COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
