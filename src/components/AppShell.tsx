'use client';

import { Button, Tooltip } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { logout } from '@/auth';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          height: 52,
          background: '#0d1526',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 7,
              height: 7,
              background: '#00d4aa',
              borderRadius: 2,
              boxShadow: '0 0 8px rgba(0,212,170,0.6)',
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#e8eeff',
              letterSpacing: '-0.01em',
            }}
          >
            FileSearch Gemini
          </span>
        </div>

        {/* Actions */}
        <Tooltip title="Cerrar sesión" placement="bottomRight">
          <Button
            type="text"
            size="small"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              color: 'rgba(232,238,255,0.35)',
              fontSize: 13,
            }}
          />
        </Tooltip>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  );
}
