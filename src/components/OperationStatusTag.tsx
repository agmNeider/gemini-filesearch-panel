'use client';

import { Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import type { OperationStatus } from '../hooks/useOperation';

interface Props {
  status: OperationStatus;
}

export function OperationStatusTag({ status }: Props) {
  switch (status) {
    case 'pending':
      return (
        <Tag icon={<SyncOutlined spin />} color="processing">
          Procesando
        </Tag>
      );
    case 'done':
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Completado
        </Tag>
      );
    case 'error':
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          Fallido
        </Tag>
      );
    default:
      return null;
  }
}
