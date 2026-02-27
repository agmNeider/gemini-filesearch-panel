'use client';

import { ConfigProvider, theme } from 'antd';
import esES from 'antd/locale/es_ES';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00d4aa',
          colorBgBase: '#080d1a',
          colorBgContainer: '#0d1526',
          colorBgElevated: '#141d35',
          colorBgLayout: '#080d1a',
          colorBgSpotlight: '#16213b',
          colorBorder: 'rgba(255,255,255,0.08)',
          colorBorderSecondary: 'rgba(255,255,255,0.05)',
          colorText: '#e8eeff',
          colorTextSecondary: 'rgba(232,238,255,0.58)',
          colorTextTertiary: 'rgba(232,238,255,0.36)',
          colorTextQuaternary: 'rgba(232,238,255,0.22)',
          fontFamily:
            "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          borderRadius: 6,
          borderRadiusLG: 8,
          borderRadiusSM: 4,
          borderRadiusXS: 2,
          colorSuccess: '#22c55e',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#00d4aa',
          colorLink: '#00d4aa',
          colorLinkHover: '#2de0b8',
          motionDurationMid: '0.15s',
          motionDurationSlow: '0.2s',
          lineHeight: 1.55,
        },
        components: {
          Table: {
            headerBg: 'rgba(255,255,255,0.025)',
            rowHoverBg: 'rgba(0,212,170,0.04)',
            borderColor: 'rgba(255,255,255,0.06)',
            headerSplitColor: 'transparent',
          },
          Card: {
            colorBorderSecondary: 'rgba(255,255,255,0.07)',
          },
          Modal: {
            contentBg: '#0d1526',
            headerBg: '#0d1526',
          },
          Input: {
            colorBgContainer: 'rgba(255,255,255,0.04)',
            activeBorderColor: '#00d4aa',
            hoverBorderColor: 'rgba(0,212,170,0.45)',
            activeShadow: '0 0 0 2px rgba(0,212,170,0.12)',
          },
          InputNumber: {
            colorBgContainer: 'rgba(255,255,255,0.04)',
            activeBorderColor: '#00d4aa',
            hoverBorderColor: 'rgba(0,212,170,0.45)',
          },
          Select: {
            colorBgContainer: 'rgba(255,255,255,0.04)',
          },
          Button: {
            colorPrimaryHover: '#2de0b8',
            colorPrimaryActive: '#00b893',
            defaultBg: 'rgba(255,255,255,0.05)',
            defaultBorderColor: 'rgba(255,255,255,0.1)',
            defaultColor: 'rgba(232,238,255,0.75)',
            defaultHoverBg: 'rgba(255,255,255,0.08)',
            defaultHoverBorderColor: 'rgba(255,255,255,0.18)',
            defaultHoverColor: '#e8eeff',
          },
          Popconfirm: {
            colorBgElevated: '#141d35',
          },
          Tooltip: {
            colorBgSpotlight: '#16213b',
          },
          Breadcrumb: {
            lastItemColor: 'rgba(232,238,255,0.6)',
            separatorColor: 'rgba(232,238,255,0.2)',
          },
          Upload: {
            colorBgContainer: 'rgba(255,255,255,0.025)',
          },
          Form: {
            labelColor: 'rgba(232,238,255,0.55)',
            labelFontSize: 12,
          },
          Alert: {
            colorInfoBg: 'rgba(0,212,170,0.08)',
            colorInfoBorder: 'rgba(0,212,170,0.2)',
          },
          Message: {
            contentBg: '#141d35',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
