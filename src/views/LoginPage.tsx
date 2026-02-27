'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { login } from '@/auth';

const { Title, Text } = Typography;

interface FormValues {
  username: string;
  password: string;
}

export function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (values: FormValues) => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      const ok = login(values.username, values.password);
      if (ok) {
        router.push('/');
      } else {
        setError(true);
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
      }}
    >
      <Card style={{ width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ margin: 0 }}>
            FileSearch Gemini
          </Title>
          <Text type="secondary">Administración de File Stores</Text>
        </div>

        {error && (
          <Alert
            message="Usuario o contraseña incorrectos"
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Ingresa tu usuario' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Usuario"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Contraseña"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Ingresar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
