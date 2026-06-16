// 创建主键对话框组件
import React, { useState } from 'react';
import { Modal, Form, Select, message } from 'antd';

interface CreatePrimaryKeyDialogProps {
  visible: boolean;
  tableName: string;
  columns: string[];
  onClose: () => void;
  onCreate: (columns: string[]) => Promise<void>;
}

const CreatePrimaryKeyDialog: React.FC<CreatePrimaryKeyDialogProps> = ({
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

      await onCreate(values.columns);
      message.success('主键创建成功');
      form.resetFields();
      onClose();
    } catch (err: any) {
      if (err.errorFields) {
        return;
      }
      message.error(`创建主键失败: ${err.message}`);
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
      title={`创建主键 - ${tableName}`}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={500}
      okText="创建"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="columns"
          label="主键列"
          rules={[{ required: true, message: '请选择至少一列' }]}
        >
          <Select mode="multiple" placeholder="选择作为主键的列">
            {columns.map((col) => (
              <Select.Option key={col} value={col}>
                {col}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
          <div style={{ fontSize: 13, color: '#666' }}>
            <strong>提示：</strong>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>主键用于唯一标识表中的每一行数据</li>
              <li>主键列的值不能为 NULL</li>
              <li>一个表只能有一个主键</li>
              <li>复合主键：选择多列组成联合主键</li>
            </ul>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePrimaryKeyDialog;
