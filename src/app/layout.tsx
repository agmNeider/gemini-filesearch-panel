import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdProvider } from '@/components/AntdProvider';

export const metadata: Metadata = {
  title: 'FileSearch Gemini',
  description: 'Administración de File Search Stores de Google Gemini',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>
        <AntdRegistry>
          <AntdProvider>{children}</AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
