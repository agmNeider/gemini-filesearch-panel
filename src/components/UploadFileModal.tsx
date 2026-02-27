'use client';

import { Modal, Form, Input, Upload, InputNumber, message, Space, Alert } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { uploadFile } from '../api/gemini';
import { useOperation } from '../hooks/useOperation';
import { OperationStatusTag } from './OperationStatusTag';
import type { UploadFile } from 'antd';

interface Props {
  open: boolean;
  storeName: string;
  onClose: () => void;
}

interface FormValues {
  displayName?: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

export function UploadFileModal({ open, storeName, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [operationName, setOperationName] = useState<string | null>(null);
  const { status, error } = useOperation(operationName);

  const isUploading = status === 'pending';
  const isDone = status === 'done';

  const handleClose = () => {
    if (isUploading) return;
    form.resetFields();
    setFileList([]);
    setOperationName(null);
    onClose();
  };

  const handleOk = async () => {
    if (isDone) {
      handleClose();
      return;
    }
    try {
      const values = await form.validateFields();
      if (!fileList[0]?.originFileObj) {
        message.warning('Selecciona un archivo primero');
        return;
      }
      setLoading(true);
      const chunkingConfig =
        values.chunkSize
          ? { chunkSize: values.chunkSize, chunkOverlap: values.chunkOverlap ?? 0 }
          : undefined;
      const op = await uploadFile(
        storeName,
        fileList[0].originFileObj,
        values.displayName || undefined,
        chunkingConfig,
      );
      setOperationName(op.name);
    } catch (e) {
      if (e instanceof Error) {
        message.error(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Subir Archivo al Store"
      open={open}
      onOk={() => void handleOk()}
      onCancel={handleClose}
      confirmLoading={loading}
      okText={isDone ? 'Cerrar' : 'Subir'}
      cancelText="Cancelar"
      okButtonProps={{ disabled: isUploading }}
      cancelButtonProps={{ disabled: isUploading }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label="Archivo" required>
          <Upload.Dragger
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
            disabled={!!operationName}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Clic o arrastra el archivo aquí</p>
            <p className="ant-upload-hint">PDF, TXT, DOCX y otros formatos soportados</p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item name="displayName" label="Nombre del documento (opcional)">
          <Input placeholder="Mi Documento" disabled={!!operationName} />
        </Form.Item>

        <Space align="start">
          <Form.Item name="chunkSize" label="Tamaño de chunk">
            <InputNumber
              min={100}
              max={8192}
              placeholder="Auto"
              disabled={!!operationName}
              style={{ width: 120 }}
            />
          </Form.Item>
          <Form.Item name="chunkOverlap" label="Overlap">
            <InputNumber
              min={0}
              max={1000}
              placeholder="0"
              disabled={!!operationName}
              style={{ width: 120 }}
            />
          </Form.Item>
        </Space>

        {operationName && (
          <Form.Item label="Estado de la operación">
            <Space direction="vertical" style={{ width: '100%' }}>
              <OperationStatusTag status={status} />
              {error && <Alert type="error" message={error} showIcon />}
              {isDone && (
                <Alert type="success" message="Archivo subido y procesado correctamente" showIcon />
              )}
            </Space>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
