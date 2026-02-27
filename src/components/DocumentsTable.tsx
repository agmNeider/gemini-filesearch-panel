'use client';

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Table, Button, Space, Tooltip, Popconfirm, Checkbox, Typography, message } from 'antd';
import { DeleteOutlined, ReloadOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { listDocuments, deleteDocument } from '@/api/gemini';
import type { Document, DocumentState } from '@/types';

interface Props {
  storeName: string;
}

export interface DocumentsTableRef {
  reload: () => void;
}

const stateConfig: Record<DocumentState, { color: string; label: string; pulse: boolean }> = {
  ACTIVE:           { color: '#22c55e', label: 'Activo',    pulse: false },
  PENDING:          { color: '#f59e0b', label: 'Pendiente', pulse: true  },
  FAILED:           { color: '#ef4444', label: 'Fallido',   pulse: false },
  STATE_UNSPECIFIED:{ color: 'rgba(232,238,255,0.25)', label: '—', pulse: false },
};

function StateIndicator({ state }: { state: DocumentState }) {
  const c = stateConfig[state] ?? stateConfig.STATE_UNSPECIFIED;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
      <span
        className={c.pulse ? 'pulse' : undefined}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: c.color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <span style={{ color: c.color, fontWeight: 500 }}>{c.label}</span>
    </span>
  );
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
        width: 160,
        render: (name: string) => (
          <Typography.Text
            copyable
            style={{ fontSize: 11, color: 'rgba(232,238,255,0.35)', fontFamily: 'monospace' }}
          >
            {docId(name)}
          </Typography.Text>
        ),
      },
      {
        title: 'Nombre',
        dataIndex: 'displayName',
        ellipsis: true,
        render: (v?: string) => (
          <span style={{ fontSize: 13, color: v ? '#e8eeff' : 'rgba(232,238,255,0.28)', fontStyle: v ? 'normal' : 'italic' }}>
            {v ?? 'Sin nombre'}
          </span>
        ),
      },
      {
        title: 'Estado',
        dataIndex: 'state',
        width: 110,
        render: (state: DocumentState) => <StateIndicator state={state} />,
      },
      {
        title: 'Tipo',
        dataIndex: 'mimeType',
        width: 170,
        ellipsis: true,
        render: (v: string) => (
          <span style={{ fontSize: 11, color: 'rgba(232,238,255,0.35)', fontFamily: 'monospace' }}>
            {v || '—'}
          </span>
        ),
      },
      {
        title: 'Tamaño',
        dataIndex: 'sizeBytes',
        width: 90,
        align: 'right',
        render: (v: number) => (
          <span style={{ fontSize: 12, color: 'rgba(232,238,255,0.5)' }}>{formatBytes(v)}</span>
        ),
      },
      {
        title: 'Creado',
        dataIndex: 'createTime',
        width: 110,
        render: (v: string) => (
          <span style={{ fontSize: 12, color: 'rgba(232,238,255,0.35)' }}>
            {new Date(v).toLocaleDateString('es')}
          </span>
        ),
      },
      {
        title: '',
        key: 'actions',
        width: 48,
        render: (_, record) => (
          <Popconfirm
            title="Eliminar documento"
            description={
              <Space direction="vertical" size={6}>
                <span style={{ fontSize: 13 }}>¿Eliminar este documento?</span>
                <Checkbox
                  checked={forceDelete}
                  onChange={(e) => setForceDelete(e.target.checked)}
                  style={{ fontSize: 12 }}
                >
                  Forzar (eliminar chunks)
                </Checkbox>
              </Space>
            }
            onConfirm={() => void handleDelete(record.name)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true, size: 'small' }}
          >
            <Tooltip title="Eliminar">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                loading={deletingKey === record.name}
                style={{ opacity: 0.5 }}
              />
            </Tooltip>
          </Popconfirm>
        ),
      },
    ];

    return (
      <>
        <Table
          rowKey="name"
          columns={columns}
          dataSource={docs}
          loading={loading}
          size="small"
          pagination={false}
          locale={{
            emptyText: (
              <div style={{ padding: '32px 0', color: 'rgba(232,238,255,0.28)', fontSize: 13 }}>
                No hay documentos en este store
              </div>
            ),
          }}
        />

        {/* Footer pagination */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => void load(pageToken)}
            loading={loading}
            style={{ color: 'rgba(232,238,255,0.4)', fontSize: 12 }}
          >
            Actualizar
          </Button>

          <Space size={4}>
            {pageToken && (
              <Button
                type="text"
                size="small"
                icon={<LeftOutlined />}
                onClick={() => setPageToken(undefined)}
                style={{ color: 'rgba(232,238,255,0.4)', fontSize: 12 }}
              >
                Primera
              </Button>
            )}
            {nextPageToken && (
              <Button
                type="text"
                size="small"
                onClick={() => setPageToken(nextPageToken)}
                style={{ color: 'rgba(232,238,255,0.4)', fontSize: 12 }}
              >
                Siguiente
                <RightOutlined style={{ fontSize: 10, marginLeft: 4 }} />
              </Button>
            )}
          </Space>
        </div>
      </>
    );
  },
);
