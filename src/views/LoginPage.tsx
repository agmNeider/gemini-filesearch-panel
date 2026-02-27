'use client';

import { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { login } from '@/auth';

interface FormValues {
  username: string;
  password: string;
}

export function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(false);
    try {
      const ok = await login(values.username, values.password);
      if (ok) {
        router.push('/');
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080d1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,212,170,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: 360, position: 'relative' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              background: 'rgba(0,212,170,0.1)',
              border: '1px solid rgba(0,212,170,0.25)',
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                background: '#00d4aa',
                borderRadius: 3,
                boxShadow: '0 0 12px rgba(0,212,170,0.6)',
              }}
            />
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#e8eeff',
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}
          >
            FileSearch Gemini
          </div>
          <div style={{ fontSize: 13, color: 'rgba(232,238,255,0.38)' }}>
            Panel de administración
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#0d1526',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: 28,
          }}
        >
          {error && (
            <Alert
              message="Usuario o contraseña incorrectos"
              type="error"
              showIcon
              style={{ marginBottom: 20, fontSize: 13 }}
            />
          )}

          <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Ingresa tu usuario' }]}
              style={{ marginBottom: 14 }}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(232,238,255,0.3)', fontSize: 13 }} />}
                placeholder="Usuario"
                size="large"
                autoComplete="username"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
              style={{ marginBottom: 20 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(232,238,255,0.3)', fontSize: 13 }} />}
                placeholder="Contraseña"
                size="large"
                autoComplete="current-password"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ fontWeight: 600 }}
            >
              Ingresar
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
