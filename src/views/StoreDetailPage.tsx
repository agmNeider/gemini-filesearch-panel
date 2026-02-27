'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Button,
  Typography,
  Space,
  Card,
  Statistic,
  Row,
  Col,
  message,
  Breadcrumb,
  Descriptions,
} from 'antd';
import {
  ReloadOutlined,
  UploadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getStore } from '@/api/gemini';
import { UploadFileModal } from '@/components/UploadFileModal';
import { DocumentsTable, type DocumentsTableRef } from '@/components/DocumentsTable';
import type { FileSearchStore } from '@/types';

const { Title } = Typography;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function StoreDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const storeName = `fileSearchStores/${id}`;
  const [store, setStore] = useState<FileSearchStore | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const docsRef = useRef<DocumentsTableRef>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s = await getStore(storeName);
      setStore(s);
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Error al cargar store');
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link href="/">Stores</Link> },
          { title: id },
        ]}
      />

      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0 }}>
          {store?.displayName ?? id}
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void load()} loading={loading}>
            Actualizar
          </Button>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setUploadOpen(true)}
          >
            Subir Archivo
          </Button>
        </Space>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Documentos Activos"
              value={store?.activeDocumentsCount ?? 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Documentos Pendientes"
              value={store?.pendingDocumentsCount ?? 0}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Documentos Fallidos"
              value={store?.failedDocumentsCount ?? 0}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tamaño Total"
              value={store ? formatBytes(store.sizeBytes) : '—'}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Detalles del Store" loading={loading} style={{ marginBottom: 24 }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Nombre interno">
            <Typography.Text code copyable>
              {storeName}
            </Typography.Text>
          </Descriptions.Item>
          {store?.displayName && (
            <Descriptions.Item label="Nombre visible">
              {store.displayName}
            </Descriptions.Item>
          )}
          {store?.createTime && (
            <Descriptions.Item label="Creado el">
              {new Date(store.createTime).toLocaleString('es')}
            </Descriptions.Item>
          )}
          {store?.updateTime && (
            <Descriptions.Item label="Última actualización">
              {new Date(store.updateTime).toLocaleString('es')}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="Documentos">
        <DocumentsTable ref={docsRef} storeName={storeName} />
      </Card>

      {id && (
        <UploadFileModal
          open={uploadOpen}
          storeName={storeName}
          onClose={() => {
            setUploadOpen(false);
            void load();
            docsRef.current?.reload();
          }}
        />
      )}
    </div>
  );
}
