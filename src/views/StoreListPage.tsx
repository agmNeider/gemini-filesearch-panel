'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Table,
  Space,
  Popconfirm,
  Checkbox,
  Typography,
  message,
  Tag,
  Tooltip,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import { listStores, deleteStore } from '@/api/gemini';
import { CreateStoreModal } from '@/components/CreateStoreModal';
import type { FileSearchStore } from '@/types';

const { Title } = Typography;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function StoreListPage() {
  const router = useRouter();
  const [stores, setStores] = useState<FileSearchStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [forceDelete, setForceDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listStores();
      setStores(res.fileSearchStores ?? []);
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Error al cargar stores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (name: string) => {
    setDeletingKey(name);
    try {
      await deleteStore(name, forceDelete);
      message.success('Store eliminado');
      void load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setDeletingKey(null);
    }
  };

  const storeId = (name: string) => name.split('/').pop() ?? name;

  const columns: ColumnsType<FileSearchStore> = [
    {
      title: 'ID',
      dataIndex: 'name',
      render: (name: string) => (
        <Typography.Text code copyable>
          {storeId(name)}
        </Typography.Text>
      ),
    },
    {
      title: 'Nombre',
      dataIndex: 'displayName',
      render: (v?: string) => v ?? <Tag color="default">Sin nombre</Tag>,
    },
    {
      title: 'Documentos',
      children: [
        {
          title: 'Activos',
          dataIndex: 'activeDocumentsCount',
          align: 'right',
          render: (v: number) => <Tag color="success">{v}</Tag>,
        },
        {
          title: 'Pendientes',
          dataIndex: 'pendingDocumentsCount',
          align: 'right',
          render: (v: number) =>
            v > 0 ? <Tag color="processing">{v}</Tag> : <Tag>{v}</Tag>,
        },
        {
          title: 'Fallidos',
          dataIndex: 'failedDocumentsCount',
          align: 'right',
          render: (v: number) =>
            v > 0 ? <Tag color="error">{v}</Tag> : <Tag>{v}</Tag>,
        },
      ],
    },
    {
      title: 'Tamaño',
      dataIndex: 'sizeBytes',
      align: 'right',
      render: (v: number) => formatBytes(v),
    },
    {
      title: 'Creado',
      dataIndex: 'createTime',
      render: (v: string) => new Date(v).toLocaleDateString('es'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Popconfirm
            title="Eliminar store"
            description={
              <Space direction="vertical">
                <span>¿Seguro que deseas eliminar este store?</span>
                <Checkbox
                  checked={forceDelete}
                  onChange={(e) => setForceDelete(e.target.checked)}
                >
                  Forzar eliminación (incluye documentos)
                </Checkbox>
              </Space>
            }
            onConfirm={() => void handleDelete(record.name)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Eliminar store">
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deletingKey === record.name}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0 }}>
          File Search Stores
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void load()} loading={loading}>
            Actualizar
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Nuevo Store
          </Button>
        </Space>
      </Space>

      <Table
        rowKey="name"
        columns={columns}
        dataSource={stores}
        loading={loading}
        pagination={{ pageSize: 20 }}
        onRow={(record) => ({
          onClick: () => router.push(`/stores/${storeId(record.name)}`),
          style: { cursor: 'pointer' },
        })}
        bordered
        locale={{ emptyText: 'No hay stores. Crea uno con el botón "Nuevo Store".' }}
      />

      <CreateStoreModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void load()}
      />
    </div>
  );
}
