import { useState, useEffect, useRef } from 'react';
import { getOperation } from '../api/gemini';
import type { Operation } from '../types';

export type OperationStatus = 'idle' | 'pending' | 'done' | 'error';

interface UseOperationResult {
  status: OperationStatus;
  operation: Operation | null;
  error: string | null;
  loading: boolean;
}

export function useOperation(operationName: string | null): UseOperationResult {
  const [status, setStatus] = useState<OperationStatus>('idle');
  const [operation, setOperation] = useState<Operation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!operationName) {
      setStatus('idle');
      setOperation(null);
      setError(null);
      return;
    }

    setStatus('pending');
    setError(null);

    const poll = async () => {
      try {
        const op = await getOperation(operationName);
        setOperation(op);
        if (op.done) {
          if (op.error) {
            setStatus('error');
            setError(op.error.message);
          } else {
            setStatus('done');
          }
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (e) {
        setStatus('error');
        setError(e instanceof Error ? e.message : 'Error desconocido');
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    void poll();
    intervalRef.current = setInterval(() => void poll(), 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [operationName]);

  return {
    status,
    operation,
    error,
    loading: status === 'pending',
  };
}
