'use client';

import { ConfigProvider, theme } from 'antd';
import esES from 'antd/locale/es_ES';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={esES} theme={{ algorithm: theme.defaultAlgorithm }}>
      {children}
    </ConfigProvider>
  );
}
