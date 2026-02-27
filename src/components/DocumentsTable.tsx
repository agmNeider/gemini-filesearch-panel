'use client';

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  Checkbox,
  Typography,
  message,
} from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { listDocuments, deleteDocument } from '../api/gemini';
import type { Document, DocumentState } from '../types';

interface Props {
  storeName: string;
}

export interface DocumentsTableRef {
  reload: () => void;
}

function StateTag({ state }: { state: DocumentState }) {
  switch (state) {
    case 'ACTIVE':
      return <Tag color="success">Activo</Tag>;
    case 'PENDING':
      return <Tag color="processing">Pendiente</Tag>;
    case 'FAILED':
      return <Tag color="error">Fallido</Tag>;
    default:
      return <Tag>{state}</Tag>;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

const docId = (name: string) => name.split('/').pop() ?? name;

export const DocumentsTable = forwardRef<DocumentsTableRef, Props>(
  function DocumentsTable({ storeName }, ref) {
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageToken, setPageToken] = useState<string | undefined>();
    const [nextPageToken, setNextPageToken] = useState<string | undefined>();
    const [deletingKey, setDeletingKey] = useState<string | null>(null);
    const [forceDelete, setForceDelete] = useState(false);

    const load = useCallback(
      async (token?: string) => {
        setLoading(true);
        try {
          const res = await listDocuments(storeName, token);
          setDocs(res.documents ?? []);
          setNextPageToken(res.nextPageToken);
        } catch (e) {
          message.error(e instanceof Error ? e.message : 'Error al cargar documentos');
        } finally {
          setLoading(false);
        }
      },
      [storeName],
    );

    useEffect(() => {
      void load(pageToken);
    }, [load, pageToken]);

    useImperativeHandle(ref, () => ({ reload: () => void load(pageToken) }));

    const handleDelete = async (name: string) => {
      setDeletingKey(name);
      try {
        await deleteDocument(name, forceDelete);
        message.success('Documento eliminado');
        void load(pageToken);
      } catch (e) {
        message.error(e instanceof Error ? e.message : 'Error al eliminar');
      } finally {
        setDeletingKey(null);
      }
    };

    const columns: ColumnsType<Document> = [
      {
        title: 'ID',
        dataIndex: 'name',
        ellipsis: true,
        render: (name: string) => (
          <Typography.Text code copyable style={{ fontSize: 12 }}>
            {docId(name)}
          </Typography.Text>
        ),
      },
      {
        title: 'Nombre',
        dataIndex: 'displayName',
        ellipsis: true,
        render: (v?: string) => v ?? <Typography.Text type="secondary">—</Typography.Text>,
      },
      {
        title: 'Estado',
        dataIndex: 'state',
        width: 110,
        render: (state: DocumentState) => <StateTag state={state} />,
      },
      {
        title: 'Tipo',
        dataIndex: 'mimeType',
        width: 160,
        ellipsis: true,
        render: (v: string) => <Typography.Text type="secondary">{v || '—'}</Typography.Text>,
      },
      {
        title: 'Tamaño',
        dataIndex: 'sizeBytes',
        width: 90,
        align: 'right',
        render: (v: number) => formatBytes(v),
      },
      {
        title: 'Creado',
        dataIndex: 'createTime',
        width: 130,
        render: (v: string) => new Date(v).toLocaleDateString('es'),
      },
      {
        title: 'Acciones',
        key: 'actions',
        width: 80,
        render: (_, record) => (
          <Popconfirm
            title="Eliminar documento"
            description={
              <Space direction="vertical">
                <span>¿Eliminar este documento?</span>
                <Checkbox
                  checked={forceDelete}
                  onChange={(e) => setForceDelete(e.target.checked)}
                >
                  Forzar (eliminar chunks)
                </Checkbox>
              </Space>
            }
            onConfirm={() => void handleDelete(record.name)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Eliminar documento">
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deletingKey === record.name}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        ),
      },
    ];

    return (
      <Table
        rowKey="name"
        columns={columns}
        dataSource={docs}
        loading={loading}
        size="small"
        bordered
        pagination={false}
        locale={{ emptyText: 'No hay documentos en este store.' }}
        footer={() => (
          <Space>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => void load(pageToken)}
              loading={loading}
            >
              Actualizar
            </Button>
            {pageToken && (
              <Button size="small" onClick={() => setPageToken(undefined)}>
                Primera página
              </Button>
            )}
            {nextPageToken && (
              <Button size="small" onClick={() => setPageToken(nextPageToken)}>
                Siguiente página
              </Button>
            )}
          </Space>
        )}
      />
    );
  },
);
