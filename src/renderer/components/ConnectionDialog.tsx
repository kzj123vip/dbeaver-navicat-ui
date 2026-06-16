// 新建连接对话框 - 分步向导
import React, { useState } from 'react';
import { Modal, Steps, Form, Input, Select, Button, Space, message, Radio, InputNumber } from 'antd';
import { Database, Server, CheckCircle } from 'lucide-react';
import { useConnections } from '../hooks/useConnections';
import type { ConnectionConfig as ApiConnectionConfig } from '../services/api';

const { Option } = Select;

interface ConnectionDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (connection: ConnectionConfig) => void;
}

interface ConnectionConfig {
  name: string;
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database?: string;
}

const CONNECTION_TYPES = [
  { value: 'mysql', label: 'MySQL', icon: '🐬', defaultPort: 3306, color: '#00758F', driver: 'mysql:mysql8' },
  { value: 'postgresql', label: 'PostgreSQL', icon: '🐘', defaultPort: 5432, color: '#336791', driver: 'postgresql:postgres-jdbc' },
  { value: 'redis', label: 'Redis', icon: '🔴', defaultPort: 6379, color: '#DC382D', driver: 'redis:jedis' },
  { value: 'mongodb', label: 'MongoDB', icon: '🍃', defaultPort: 27017, color: '#47A248', driver: 'mongodb:mongodb' },
  { value: 'sqlite', label: 'SQLite', icon: '📦', defaultPort: 0, color: '#003B57', driver: 'sqlite:sqlite_jdbc' },
  { value: 'oracle', label: 'Oracle', icon: '🔴', defaultPort: 1521, color: '#F80000', driver: 'oracle:oracle_thin' },
  { value: 'sqlserver', label: 'SQL Server', icon: '🪟', defaultPort: 1433, color: '#CC2927', driver: 'sqlserver:microsoft' },
  { value: 'mariadb', label: 'MariaDB', icon: '🦭', defaultPort: 3306, color: '#003545', driver: 'mysql:mariaDB' },
];

/**
 * 将对话框表单配置转换为 API 连接配置
 */
function toApiConfig(values: ConnectionConfig): ApiConnectionConfig {
  const dbType = CONNECTION_TYPES.find((t) => t.value === values.type);
  return {
    name: values.name,
    driverId: dbType?.driver || values.type,
    host: values.host,
    port: String(values.port), // 转换为字符串
    databaseName: values.database || '',
    credentials: {
      userName: values.username,
      userPassword: values.password,
    },
    providerProperties: {
      allowPublicKeyRetrieval: 'true', // MySQL 8 必需
      useSSL: 'false', // 本地测试可关闭
    },
    saveCredentials: true,
  };
}

const ConnectionDialog: React.FC<ConnectionDialogProps> = ({ visible, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testMessage, setTestMessage] = useState<string>('');
  const { createConnection, testConnection } = useConnections();

  const handleNext = async () => {
    try {
      await form.validateFields();
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      message.warning('请完成当前步骤');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleTypeChange = (type: string) => {
    const dbType = CONNECTION_TYPES.find(t => t.value === type);
    if (dbType) {
      form.setFieldsValue({ port: dbType.defaultPort });
    }
  };

  const handleTestConnection = async () => {
    try {
      await form.validateFields(['host', 'port', 'username', 'password']);
      setTesting(true);
      setTestResult(null);

      const values = form.getFieldsValue();
      const result = await testConnection(toApiConfig(values));

      setTesting(false);
      if (result.success) {
        setTestResult('success');
        setTestMessage(result.message || '');
      } else {
        setTestResult('error');
        setTestMessage(result.message || '连接失败');
      }
    } catch (error) {
      setTesting(false);
      message.error('请填写完整的连接信息');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const newConnection = await createConnection(toApiConfig(values));
      onSave(values);
      handleClose();
    } catch (error) {
      // 错误已在 hook 中处理
    }
  };

  const handleClose = () => {
    form.resetFields();
    setCurrentStep(0);
    setTestResult(null);
    setTestMessage('');
    onClose();
  };

  return (
    <Modal
      title="新建连接"
      open={visible}
      onCancel={handleClose}
      width={700}
      footer={null}
    >
      <Steps
        current={currentStep}
        style={{ marginBottom: 32 }}
        items={[
          { title: '选择类型', icon: <Database size={20} /> },
          { title: '配置连接', icon: <Server size={20} /> },
          { title: '测试连接', icon: <CheckCircle size={20} /> },
        ]}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: '',
        }}
      >
        {/* 步骤 1: 选择数据库类型 */}
        {currentStep === 0 && (
          <div>
            <Form.Item
              name="type"
              label="数据库类型"
              rules={[{ required: true, message: '请选择数据库类型' }]}
            >
              <Radio.Group onChange={e => handleTypeChange(e.target.value)}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {CONNECTION_TYPES.map(type => (
                    <Radio.Button
                      key={type.value}
                      value={type.value}
                      style={{
                        width: '100%',
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 16,
                      }}
                    >
                      <span style={{ fontSize: 32, marginRight: 12 }}>{type.icon}</span>
                      <span style={{ fontWeight: 500 }}>{type.label}</span>
                    </Radio.Button>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="name"
              label="连接名称"
              rules={[{ required: true, message: '请输入连接名称' }]}
            >
              <Input placeholder="例如：本地开发环境" />
            </Form.Item>
          </div>
        )}

        {/* 步骤 2: 配置连接信息 */}
        {currentStep === 1 && (
          <div>
            <Form.Item
              name="host"
              label="主机"
              rules={[{ required: true, message: '请输入主机地址' }]}
            >
              <Input placeholder="localhost 或 IP 地址" />
            </Form.Item>

            <Form.Item
              name="port"
              label="端口"
              rules={[{ required: true, message: '请输入端口号' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} max={65535} />
            </Form.Item>

            <Form.Item
              name="database"
              label="数据库（可选）"
            >
              <Input placeholder="留空则连接后选择" />
            </Form.Item>

            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="数据库用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="数据库密码" />
            </Form.Item>
          </div>
        )}

        {/* 步骤 3: 测试连接 */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            {testResult === null && (
              <div>
                <Server size={64} color="#ccc" strokeWidth={1} />
                <p style={{ marginTop: 16, color: '#666' }}>点击下方按钮测试连接</p>
              </div>
            )}

            {testResult === 'success' && (
              <div>
                <CheckCircle size={64} color="#52c41a" strokeWidth={1.5} />
                <p style={{ marginTop: 16, color: '#52c41a', fontSize: 16, fontWeight: 500 }}>
                  连接成功！
                </p>
                {testMessage && <p style={{ color: '#999' }}>{testMessage}</p>}
                {!testMessage && <p style={{ color: '#999' }}>可以保存此连接了</p>}
              </div>
            )}

            {testResult === 'error' && (
              <div>
                <Database size={64} color="#ff4d4f" strokeWidth={1.5} />
                <p style={{ marginTop: 16, color: '#ff4d4f', fontSize: 16, fontWeight: 500 }}>
                  连接失败
                </p>
                <p style={{ color: '#999', maxWidth: 400, margin: '8px auto' }}>
                  {testMessage || '请检查配置信息后重试'}
                </p>
              </div>
            )}

            <Button
              type="primary"
              loading={testing}
              onClick={handleTestConnection}
              style={{ marginTop: 24 }}
            >
              {testing ? '测试中...' : testResult === 'error' ? '重新测试' : '测试连接'}
            </Button>
          </div>
        )}
      </Form>

      {/* 底部按钮 */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleClose}>取消</Button>
        <Space>
          {currentStep > 0 && (
            <Button onClick={handlePrevious}>上一步</Button>
          )}
          {currentStep < 2 && (
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
          )}
          {currentStep === 2 && testResult === 'success' && (
            <Button type="primary" onClick={handleSave}>
              保存连接
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
};

export default ConnectionDialog;
