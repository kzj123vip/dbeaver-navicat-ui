// 添加列对话框组件
import React, { useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, message } from 'antd';

interface AddColumnDialogProps {
  visible: boolean;
  tableName: string;
  onClose: () => void;
  onAdd: (column: ColumnDefinition) => Promise<void>;
}

export interface ColumnDefinition {
  name: string;
  type: string;
  length?: number;
  nullable: boolean;
  defaultValue?: string;
  comment?: string;
  autoIncrement?: boolean;
  primaryKey?: boolean;
}

const DATA_TYPES = [
  'INT', 'BIGINT', 'VARCHAR', 'TEXT', 'DATETIME', 'TIMESTAMP', 'DATE',
  'DECIMAL', 'FLOAT', 'DOUBLE', 'BOOLEAN', 'JSON', 'BLOB'
];

const AddColumnDialog: React.FC<AddColumnDialogProps> = ({
  visible,
  tableName,
  onClose,
  onAdd,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('VARCHAR');

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const columnDef: ColumnDefinition = {
        name: values.name,
        type: values.type,
        length: values.length,
        nullable: values.nullable ?? true,
        defaultValue: values.defaultValue,
        comment: values.comment,
        autoIncrement: values.autoIncrement ?? false,
        primaryKey: values.primaryKey ?? false,
      };

      await onAdd(columnDef);
      message.success(`列 "${values.name}" 添加成功`);
      form.resetFields();
      onClose();
    } catch (err: any) {
      if (err.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(`添加列失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const needsLength = ['VARCHAR', 'CHAR', 'DECIMAL'];

  return (
    <Modal
      title={`添加列 - ${tableName}`}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      okText="添加"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'VARCHAR',
          length: 255,
          nullable: true,
          autoIncrement: false,
          primaryKey: false,
        }}
      >
        <Form.Item
          name="name"
          label="列名"
          rules={[
            { required: true, message: '请输入列名' },
            { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '列名只能包含字母、数字和下划线，且不能以数字开头' },
          ]}
        >
          <Input placeholder="例如: user_id" />
        </Form.Item>

        <Form.Item
          name="type"
          label="数据类型"
          rules={[{ required: true, message: '请选择数据类型' }]}
        >
          <Select onChange={(value) => setSelectedType(value)}>
            {DATA_TYPES.map((type) => (
              <Select.Option key={type} value={type}>
                {type}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {needsLength.includes(selectedType) && (
          <Form.Item
            name="length"
            label="长度"
            rules={[{ required: true, message: '请输入长度' }]}
          >
            <InputNumber min={1} max={65535} style={{ width: '100%' }} />
          </Form.Item>
        )}

        <Form.Item name="nullable" label="允许 NULL" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="autoIncrement" label="自动递增" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="primaryKey" label="主键" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="defaultValue" label="默认值">
          <Input placeholder="例如: 0, 'default', CURRENT_TIMESTAMP" />
        </Form.Item>

        <Form.Item name="comment" label="备注">
          <Input.TextArea rows={2} placeholder="列的说明文字" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddColumnDialog;
