// 创建索引对话框组件
import React, { useState } from 'react';
import { Modal, Form, Input, Select, Checkbox, message } from 'antd';

interface CreateIndexDialogProps {
  visible: boolean;
  tableName: string;
  columns: string[];
  onClose: () => void;
  onCreate: (index: IndexDefinition) => Promise<void>;
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  type: 'NORMAL' | 'UNIQUE' | 'FULLTEXT';
}

const CreateIndexDialog: React.FC<CreateIndexDialogProps> = ({
  visible,
  tableName,
  columns,
  onClose,
  onCreate,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const indexDef: IndexDefinition = {
        name: values.name,
        columns: values.columns,
        type: values.type || 'NORMAL',
      };

      await onCreate(indexDef);
      message.success(`索引 "${values.name}" 创建成功`);
      form.resetFields();
      onClose();
    } catch (err: any) {
      if (err.errorFields) {
        return;
      }
      message.error(`创建索引失败: ${err.message}`);
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
      title={`创建索引 - ${tableName}`}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      okText="创建"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'NORMAL',
        }}
      >
        <Form.Item
          name="name"
          label="索引名称"
          rules={[
            { required: true, message: '请输入索引名称' },
            { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '索引名只能包含字母、数字和下划线' },
          ]}
        >
          <Input placeholder="例如: idx_user_email" />
        </Form.Item>

        <Form.Item
          name="type"
          label="索引类型"
          rules={[{ required: true, message: '请选择索引类型' }]}
        >
          <Select>
            <Select.Option value="NORMAL">普通索引</Select.Option>
            <Select.Option value="UNIQUE">唯一索引</Select.Option>
            <Select.Option value="FULLTEXT">全文索引</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="columns"
          label="索引列"
          rules={[{ required: true, message: '请选择至少一列' }]}
        >
          <Select mode="multiple" placeholder="选择要建立索引的列">
            {columns.map((col) => (
              <Select.Option key={col} value={col}>
                {col}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginTop: 16 }}>
          <div style={{ fontSize: 13, color: '#666' }}>
            <strong>提示：</strong>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>普通索引：提升查询速度</li>
              <li>唯一索引：确保列值唯一</li>
              <li>全文索引：用于全文搜索（仅 TEXT 列）</li>
              <li>复合索引：选择多列创建联合索引</li>
            </ul>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateIndexDialog;
