const COOKIE = 'fsg_auth';

export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes(`${COOKIE}=true`);
}

export function login(username: string, password: string): boolean {
  if (username === 'agentemotor' && password === 'AgentemotorR4G32!') {
    document.cookie = `${COOKIE}=true; path=/; SameSite=Strict`;
    return true;
  }
  return false;
}

export function logout(): void {
  document.cookie = `${COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
