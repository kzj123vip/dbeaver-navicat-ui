// 数据导出对话框 - 支持多种格式
import React, { useState } from 'react';
import { Modal, Form, Select, Radio, InputNumber, Switch, Space, Button, Progress, message } from 'antd';
import { Download, FileText, Table as TableIcon, Database, Code } from 'lucide-react';

const { Option } = Select;

interface ExportDialogProps {
  visible: boolean;
  tableName?: string;
  rowCount?: number;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
}

interface ExportConfig {
  format: 'csv' | 'excel' | 'json' | 'sql';
  includeHeader: boolean;
  maxRows?: number;
  encoding: string;
}

const EXPORT_FORMATS = [
  {
    value: 'csv',
    label: 'CSV 文件',
    icon: <FileText size={24} color="#52c41a" />,
    description: '逗号分隔值，适合 Excel 打开',
    extension: '.csv',
  },
  {
    value: 'excel',
    label: 'Excel 文件',
    icon: <TableIcon size={24} color="#217346" />,
    description: 'Microsoft Excel 格式（.xlsx）',
    extension: '.xlsx',
  },
  {
    value: 'json',
    label: 'JSON 文件',
    icon: <Code size={24} color="#faad14" />,
    description: 'JavaScript 对象表示法',
    extension: '.json',
  },
  {
    value: 'sql',
    label: 'SQL 插入语句',
    icon: <Database size={24} color="#1890ff" />,
    description: 'INSERT INTO 语句',
    extension: '.sql',
  },
];

const ExportDialog: React.FC<ExportDialogProps> = ({
  visible,
  tableName = 'users',
  rowCount = 100,
  onClose,
  onExport,
}) => {
  const [form] = Form.useForm();
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    try {
      const values = await form.validateFields();
      setExporting(true);
      setProgress(0);

      // 模拟导出进度
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setExporting(false);
            message.success('导出完成！');
            onExport(values);
            handleClose();
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    } catch (error) {
      message.error('请完成所有必填项');
    }
  };

  const handleClose = () => {
    form.resetFields();
    setProgress(0);
    setExporting(false);
    onClose();
  };

  return (
    <Modal
      title={`导出表: ${tableName}`}
      open={visible}
      onCancel={handleClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={exporting}>
          取消
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<Download size={16} />}
          onClick={handleExport}
          loading={exporting}
        >
          {exporting ? '导出中...' : '开始导出'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          format: 'csv',
          includeHeader: true,
          maxRows: rowCount,
          encoding: 'UTF-8',
        }}
      >
        {/* 导出格式 */}
        <Form.Item
          name="format"
          label="导出格式"
          rules={[{ required: true, message: '请选择导出格式' }]}
        >
          <Radio.Group style={{ width: '100%' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {EXPORT_FORMATS.map(format => (
                <Radio.Button
                  key={format.value}
                  value={format.value}
                  style={{
                    width: '100%',
                    height: 'auto',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ marginRight: 12 }}>{format.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{format.label}</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {format.description}
                      </div>
                    </div>
                  </div>
                </Radio.Button>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>

        {/* 导出选项 */}
        <Form.Item
          name="includeHeader"
          label="包含表头"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="maxRows"
          label="最大行数"
          tooltip="限制导出的行数，留空则导出全部"
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            max={1000000}
            placeholder={`最多 ${rowCount} 行`}
          />
        </Form.Item>

        <Form.Item
          name="encoding"
          label="字符编码"
        >
          <Select>
            <Option value="UTF-8">UTF-8（推荐）</Option>
            <Option value="GBK">GBK（简体中文）</Option>
            <Option value="GB2312">GB2312</Option>
            <Option value="UTF-16">UTF-16</Option>
          </Select>
        </Form.Item>

        {/* 导出进度 */}
        {exporting && (
          <div style={{ marginTop: 24 }}>
            <Progress percent={progress} status="active" />
            <p style={{ textAlign: 'center', color: '#999', marginTop: 8 }}>
              正在导出 {Math.floor((progress / 100) * rowCount)} / {rowCount} 行...
            </p>
          </div>
        )}
      </Form>

      {/* 导出信息 */}
      {!exporting && (
        <div style={{
          background: '#f5f5f5',
          padding: 12,
          borderRadius: 4,
          marginTop: 16,
        }}>
          <Space direction="vertical" size={4}>
            <div style={{ fontSize: 13, color: '#666' }}>
              📊 <strong>当前表：</strong>{tableName}
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>
              📈 <strong>总行数：</strong>{rowCount} 行
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>
              💾 <strong>预计大小：</strong>约 {Math.round(rowCount * 0.1)} KB
            </div>
          </Space>
        </div>
      )}
    </Modal>
  );
};

export default ExportDialog;
