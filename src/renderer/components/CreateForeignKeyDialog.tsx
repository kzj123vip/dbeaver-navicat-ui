// 创建外键对话框组件
import React, { useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';

interface CreateForeignKeyDialogProps {
  visible: boolean;
  tableName: string;
  columns: string[];
  onClose: () => void;
  onCreate: (fk: ForeignKeyDefinition) => Promise<void>;
}

export interface ForeignKeyDefinition {
  name: string;
  column: string;
  refTable: string;
  refColumn: string;
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

const CreateForeignKeyDialog: React.FC<CreateForeignKeyDialogProps> = ({
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

      const fkDef: ForeignKeyDefinition = {
        name: values.name,
        column: values.column,
        refTable: values.refTable,
        refColumn: values.refColumn,
        onDelete: values.onDelete || 'RESTRICT',
        onUpdate: values.onUpdate || 'RESTRICT',
      };

      await onCreate(fkDef);
      message.success(`外键 "${values.name}" 创建成功`);
      form.resetFields();
      onClose();
    } catch (err: any) {
      if (err.errorFields) {
        return;
      }
      message.error(`创建外键失败: ${err.message}`);
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
      title={`创建外键 - ${tableName}`}
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
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT',
        }}
      >
        <Form.Item
          name="name"
          label="外键名称"
          rules={[
            { required: true, message: '请输入外键名称' },
            { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '外键名只能包含字母、数字和下划线' },
          ]}
        >
          <Input placeholder="例如: fk_user_role" />
        </Form.Item>

        <Form.Item
          name="column"
          label="本表列"
          rules={[{ required: true, message: '请选择列' }]}
        >
          <Select placeholder="选择本表的列">
            {columns.map((col) => (
              <Select.Option key={col} value={col}>
                {col}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="refTable"
          label="引用表"
          rules={[{ required: true, message: '请输入引用表名' }]}
        >
          <Input placeholder="例如: roles" />
        </Form.Item>

        <Form.Item
          name="refColumn"
          label="引用列"
          rules={[{ required: true, message: '请输入引用列名' }]}
        >
          <Input placeholder="例如: id" />
        </Form.Item>

        <Form.Item name="onDelete" label="删除时">
          <Select>
            <Select.Option value="RESTRICT">RESTRICT（限制删除）</Select.Option>
            <Select.Option value="CASCADE">CASCADE（级联删除）</Select.Option>
            <Select.Option value="SET NULL">SET NULL（设为空）</Select.Option>
            <Select.Option value="NO ACTION">NO ACTION（无操作）</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="onUpdate" label="更新时">
          <Select>
            <Select.Option value="RESTRICT">RESTRICT（限制更新）</Select.Option>
            <Select.Option value="CASCADE">CASCADE（级联更新）</Select.Option>
            <Select.Option value="SET NULL">SET NULL（设为空）</Select.Option>
            <Select.Option value="NO ACTION">NO ACTION（无操作）</Select.Option>
          </Select>
        </Form.Item>

        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
          <div style={{ fontSize: 13, color: '#666' }}>
            <strong>提示：</strong>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>外键用于建立表之间的关联关系</li>
              <li>CASCADE：父表删除/更新时，子表自动删除/更新</li>
              <li>RESTRICT：父表有关联数据时，禁止删除/更新</li>
              <li>SET NULL：父表删除/更新时，子表外键设为 NULL</li>
            </ul>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateForeignKeyDialog;
