'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Space, Popconfirm, Checkbox, Typography, message, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { listStores, deleteStore } from '@/api/gemini';
import { CreateStoreModal } from '@/components/CreateStoreModal';
import type { FileSearchStore } from '@/types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function HealthBar({ active, pending, failed }: { active: number; pending: number; failed: number }) {
  const total = active + pending + failed;
  if (total === 0) {
    return (
      <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }} />
    );
  }
  return (
    <div style={{ height: 3, borderRadius: 2, overflow: 'hidden', display: 'flex', gap: 1 }}>
      {active > 0 && (
        <div style={{ flex: active, background: '#22c55e', minWidth: 3 }} />
      )}
      {pending > 0 && (
        <div style={{ flex: pending, background: '#f59e0b', minWidth: 3 }} />
      )}
      {failed > 0 && (
        <div style={{ flex: failed, background: '#ef4444', minWidth: 3 }} />
      )}
    </div>
  );
}

function StatDot({
  color,
  count,
  label,
  pulse,
}: {
  color: string;
  count: number;
  label: string;
  pulse?: boolean;
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
      <span
        className={pulse ? 'pulse' : undefined}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <span style={{ color, fontWeight: 600 }}>{count}</span>
      <span style={{ color: 'rgba(232,238,255,0.35)' }}>{label}</span>
    </span>
  );
}

interface StoreCardProps {
  store: FileSearchStore;
  onNavigate: () => void;
  onDelete: (name: string) => Promise<void>;
  deleting: boolean;
  forceDelete: boolean;
  setForceDelete: (v: boolean) => void;
}

function StoreCard({ store, onNavigate, onDelete, deleting, forceDelete, setForceDelete }: StoreCardProps) {
  const [hovered, setHovered] = useState(false);
  const id = store.name.split('/').pop() ?? store.name;

  return (
    <div
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#111c30' : '#0d1526',
        border: `1px solid ${hovered ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 8,
        padding: '18px 18px 14px',
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* Top row: ID + delete */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
        }}
      >
        <Typography.Text
          style={{
            fontSize: 11,
            color: 'rgba(232,238,255,0.3)',
            fontFamily: 'monospace',
          }}
        >
          {id}
        </Typography.Text>

        <div onClick={(e) => e.stopPropagation()}>
          <Popconfirm
            title="Eliminar store"
            description={
              <Space direction="vertical" size={6}>
                <span style={{ fontSize: 13 }}>¿Seguro que deseas eliminarlo?</span>
                <Checkbox
                  checked={forceDelete}
                  onChange={(e) => setForceDelete(e.target.checked)}
                  style={{ fontSize: 12 }}
                >
                  Forzar (incluye documentos)
                </Checkbox>
              </Space>
            }
            onConfirm={() => void onDelete(store.name)}
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
                loading={deleting}
                style={{
                  opacity: hovered ? 1 : 0.4,
                  transition: 'opacity 0.15s',
                  height: 22,
                  width: 22,
                  minWidth: 0,
                  padding: 0,
                }}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      </div>

      {/* Display name */}
      <div style={{ marginBottom: 14 }}>
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: store.displayName ? '#e8eeff' : 'rgba(232,238,255,0.28)',
            fontStyle: store.displayName ? 'normal' : 'italic',
            letterSpacing: '-0.01em',
          }}
        >
          {store.displayName ?? 'Sin nombre'}
        </span>
      </div>

      {/* Health bar — the signature */}
      <HealthBar
        active={store.activeDocumentsCount}
        pending={store.pendingDocumentsCount}
        failed={store.failedDocumentsCount}
      />

      {/* Stat dots */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
        <StatDot color="#22c55e" count={store.activeDocumentsCount} label="activos" />
        {store.pendingDocumentsCount > 0 && (
          <StatDot color="#f59e0b" count={store.pendingDocumentsCount} label="pendientes" pulse />
        )}
        {store.failedDocumentsCount > 0 && (
          <StatDot color="#ef4444" count={store.failedDocumentsCount} label="fallidos" />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: 11,
          color: 'rgba(232,238,255,0.25)',
        }}
      >
        <span>{formatBytes(store.sizeBytes)}</span>
        <span>{new Date(store.createTime).toLocaleDateString('es')}</span>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 8px)',
          gap: 4,
          marginBottom: 8,
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: i === 4 ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.07)',
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(232,238,255,0.7)' }}>
        No hay stores
      </div>
      <div style={{ fontSize: 13, color: 'rgba(232,238,255,0.35)', textAlign: 'center', maxWidth: 280 }}>
        Los stores son contenedores de documentos para tu sistema RAG
      </div>
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreate} style={{ marginTop: 8 }}>
        Crear primer store
      </Button>
    </div>
  );
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

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#e8eeff',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            File Search Stores
          </div>
          <div style={{ fontSize: 13, color: 'rgba(232,238,255,0.35)' }}>
            {loading ? '—' : `${stores.length} store${stores.length !== 1 ? 's' : ''}`}
          </div>
        </div>
        <Space size={8}>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => void load()}
            loading={loading}
            size="small"
          >
            Actualizar
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            size="small"
          >
            Nuevo Store
          </Button>
        </Space>
      </div>

      {/* Grid or empty state */}
      {!loading && stores.length === 0 ? (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 12,
          }}
        >
          {stores.map((store) => (
            <StoreCard
              key={store.name}
              store={store}
              onNavigate={() => router.push(`/stores/${storeId(store.name)}`)}
              onDelete={handleDelete}
              deleting={deletingKey === store.name}
              forceDelete={forceDelete}
              setForceDelete={setForceDelete}
            />
          ))}
        </div>
      )}

      <CreateStoreModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void load()}
      />
    </div>
  );
}
