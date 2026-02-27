import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { username, password } = (await request.json()) as {
    username: string;
    password: string;
  };

  const validUser = process.env.AUTH_USERNAME;
  const validPass = process.env.AUTH_PASSWORD;

  if (!validUser || !validPass) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  if (username === validUser && password === validPass) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set('fsg_auth', 'true', { path: '/', sameSite: 'strict' });
    return response;
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
