'use client';

import type { OperationStatus } from '../hooks/useOperation';

const config: Record<OperationStatus, { color: string; label: string; pulse: boolean }> = {
  idle:    { color: 'rgba(232,238,255,0.2)', label: 'Inactivo',    pulse: false },
  pending: { color: '#f59e0b',               label: 'Procesando',  pulse: true  },
  done:    { color: '#22c55e',               label: 'Completado',  pulse: false },
  error:   { color: '#ef4444',               label: 'Fallido',     pulse: false },
};

export function OperationStatusTag({ status }: { status: OperationStatus }) {
  const c = config[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
      <span
        className={c.pulse ? 'pulse' : undefined}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: c.color,
          display: 'inline-block',
          flexShrink: 0,
          boxShadow: c.pulse ? `0 0 6px ${c.color}` : 'none',
        }}
      />
      <span style={{ color: c.color, fontWeight: 500 }}>{c.label}</span>
    </span>
  );
}
