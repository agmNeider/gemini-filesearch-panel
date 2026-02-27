'use client';

import { Modal, Form, Input, message } from 'antd';
import { useState } from 'react';
import { createStore } from '../api/gemini';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateStoreModal({ open, onClose, onCreated }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields() as { displayName?: string };
      setLoading(true);
      await createStore(values.displayName || undefined);
      message.success('Store creado exitosamente');
      form.resetFields();
      onCreated();
      onClose();
    } catch (e) {
      if (e instanceof Error) {
        message.error(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Nuevo File Search Store"
      open={open}
      onOk={() => void handleOk()}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Crear"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="displayName"
          label="Nombre (opcional)"
          rules={[{ max: 512, message: 'Máximo 512 caracteres' }]}
        >
          <Input placeholder="Mi Store de Documentos" maxLength={512} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
