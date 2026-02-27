'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Typography, Space, message, Breadcrumb } from 'antd';
import { ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getStore } from '@/api/gemini';
import { UploadFileModal } from '@/components/UploadFileModal';
import { DocumentsTable, type DocumentsTableRef } from '@/components/DocumentsTable';
import type { FileSearchStore } from '@/types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function HealthBar({
  active,
  pending,
  failed,
}: {
  active: number;
  pending: number;
  failed: number;
}) {
  const total = active + pending + failed;
  if (total === 0) {
    return <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }} />;
  }
  return (
    <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', gap: 2 }}>
      {active > 0 && <div style={{ flex: active, background: '#22c55e', minWidth: 4 }} />}
      {pending > 0 && <div style={{ flex: pending, background: '#f59e0b', minWidth: 4 }} />}
      {failed > 0 && <div style={{ flex: failed, background: '#ef4444', minWidth: 4 }} />}
    </div>
  );
}

function CorpusStat({
  value,
  label,
  color,
  pulse,
}: {
  value: string | number;
  label: string;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span
        className={pulse ? 'pulse' : undefined}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          boxShadow: pulse ? `0 0 6px ${color}` : 'none',
        }}
      />
      <span style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </span>
      <span
        style={{
          fontSize: 11,
          color: 'rgba(232,238,255,0.35)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          alignSelf: 'flex-end',
          paddingBottom: 2,
        }}
      >
        {label}
      </span>
    </div>
  );
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

  const hasPending = (store?.pendingDocumentsCount ?? 0) > 0;
  const hasFailed = (store?.failedDocumentsCount ?? 0) > 0;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[{ title: <Link href="/">Stores</Link> }, { title: id }]}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#e8eeff',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            {store?.displayName ?? (
              <span style={{ color: 'rgba(232,238,255,0.35)', fontStyle: 'italic' }}>
                Sin nombre
              </span>
            )}
          </div>
          <Typography.Text
            style={{
              fontSize: 11,
              color: 'rgba(232,238,255,0.3)',
              fontFamily: 'monospace',
            }}
          >
            {storeName}
          </Typography.Text>
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
            icon={<UploadOutlined />}
            onClick={() => setUploadOpen(true)}
            size="small"
          >
            Subir Archivo
          </Button>
        </Space>
      </div>

      {/* Corpus health block */}
      <div
        style={{
          background: '#0d1526',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8,
          padding: '20px 24px',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(232,238,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 14,
          }}
        >
          Salud del corpus
        </div>

        {/* Health bar */}
        <HealthBar
          active={store?.activeDocumentsCount ?? 0}
          pending={store?.pendingDocumentsCount ?? 0}
          failed={store?.failedDocumentsCount ?? 0}
        />

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: 32,
            marginTop: 14,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <CorpusStat
            value={store?.activeDocumentsCount ?? 0}
            label="activos"
            color="#22c55e"
          />
          {hasPending && (
            <CorpusStat
              value={store?.pendingDocumentsCount ?? 0}
              label="pendientes"
              color="#f59e0b"
              pulse
            />
          )}
          {hasFailed && (
            <CorpusStat
              value={store?.failedDocumentsCount ?? 0}
              label="fallidos"
              color="#ef4444"
            />
          )}

          {/* Divider */}
          <div
            style={{
              width: 1,
              height: 28,
              background: 'rgba(255,255,255,0.07)',
              marginLeft: 'auto',
            }}
          />

          {/* Metadata */}
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(232,238,255,0.55)', fontWeight: 500 }}>
                {store ? formatBytes(store.sizeBytes) : '—'}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(232,238,255,0.28)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: 2,
                }}
              >
                Tamaño
              </div>
            </div>
            {store?.createTime && (
              <div>
                <div style={{ fontSize: 13, color: 'rgba(232,238,255,0.55)', fontWeight: 500 }}>
                  {new Date(store.createTime).toLocaleDateString('es')}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(232,238,255,0.28)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginTop: 2,
                  }}
                >
                  Creado
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents section */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(232,238,255,0.55)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 12,
          }}
        >
          Documentos
        </div>
        <div
          style={{
            background: '#0d1526',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <DocumentsTable ref={docsRef} storeName={storeName} />
        </div>
      </div>

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
