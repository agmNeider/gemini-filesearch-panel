'use client';

import { Layout, Typography, Button, Tooltip } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { logout } from '@/auth';

const { Header, Content } = Layout;

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
          FileSearch Gemini
        </Typography.Title>
        <Tooltip title="Cerrar sesión">
          <Button
            type="text"
            icon={<LogoutOutlined />}
            style={{ color: 'rgba(255,255,255,0.65)' }}
            onClick={handleLogout}
          />
        </Tooltip>
      </Header>
      <Content style={{ background: '#f5f5f5' }}>{children}</Content>
    </Layout>
  );
}
