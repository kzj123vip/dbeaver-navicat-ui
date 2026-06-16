// 表属性面板 - 显示表结构、索引、外键等信息
import React, { useState } from 'react';
import { Tabs, Table, Tag, Typography, Space } from 'antd';
import { Key, Link, Info } from 'lucide-react';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface TablePropertiesProps {
  tableName?: string;
}

const TableProperties: React.FC<TablePropertiesProps> = ({ tableName }) => {
  if (!tableName) {
    return (
      <div style={{ padding: 16, color: '#999', textAlign: 'center' }}>
        <Info size={48} color="#ccc" strokeWidth={1} />
        <p style={{ marginTop: 16 }}>选择一个表查看详情</p>
      </div>
    );
  }

  // 模拟列信息
  const columns = [
    {
      key: 1,
      name: 'id',
      type: 'INT',
      length: 11,
      nullable: false,
      primary: true,
      autoIncrement: true,
      defaultValue: null,
      comment: '主键ID',
    },
    {
      key: 2,
      name: 'name',
      type: 'VARCHAR',
      length: 100,
      nullable: false,
      primary: false,
      autoIncrement: false,
      defaultValue: null,
      comment: '姓名',
    },
    {
      key: 3,
      name: 'email',
      type: 'VARCHAR',
      length: 255,
      nullable: false,
      primary: false,
      autoIncrement: false,
      defaultValue: null,
      comment: '邮箱地址',
    },
    {
      key: 4,
      name: 'age',
      type: 'INT',
      length: 11,
      nullable: true,
      primary: false,
      autoIncrement: false,
      defaultValue: null,
      comment: '年龄',
    },
    {
      key: 5,
      name: 'created_at',
      type: 'TIMESTAMP',
      length: null,
      nullable: false,
      primary: false,
      autoIncrement: false,
      defaultValue: 'CURRENT_TIMESTAMP',
      comment: '创建时间',
    },
  ];

  // 模拟索引信息
  const indexes = [
    {
      key: 1,
      name: 'PRIMARY',
      type: 'PRIMARY KEY',
      columns: ['id'],
      unique: true,
    },
    {
      key: 2,
      name: 'idx_email',
      type: 'UNIQUE',
      columns: ['email'],
      unique: true,
    },
    {
      key: 3,
      name: 'idx_name',
      type: 'INDEX',
      columns: ['name'],
      unique: false,
    },
  ];

  // 模拟外键信息
  const foreignKeys = [
    {
      key: 1,
      name: 'fk_user_department',
      column: 'department_id',
      refTable: 'departments',
      refColumn: 'id',
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  ];

  const columnColumns = [
    {
      title: '列名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text: string, record: any) => (
        <Space>
          {record.primary && <Key size={14} color="#faad14" />}
          <Text strong={record.primary}>{text}</Text>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (text: string, record: any) => (
        <Text>
          {text}
          {record.length && `(${record.length})`}
        </Text>
      ),
    },
    {
      title: '可空',
      dataIndex: 'nullable',
      key: 'nullable',
      width: 60,
      render: (nullable: boolean) => (
        <Tag color={nullable ? 'default' : 'red'}>{nullable ? '是' : '否'}</Tag>
      ),
    },
    {
      title: '自增',
      dataIndex: 'autoIncrement',
      key: 'autoIncrement',
      width: 60,
      render: (auto: boolean) => (auto ? <Tag color="blue">是</Tag> : '-'),
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 120,
      render: (value: any) => (
        <Text type="secondary">{value || '-'}</Text>
      ),
    },
    {
      title: '备注',
      dataIndex: 'comment',
      key: 'comment',
      render: (text: string) => (
        <Text type="secondary">{text || '-'}</Text>
      ),
    },
  ];

  const indexColumns = [
    {
      title: '索引名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => {
        let color = 'default';
        if (text === 'PRIMARY KEY') color = 'red';
        if (text === 'UNIQUE') color = 'orange';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '列',
      dataIndex: 'columns',
      key: 'columns',
      render: (cols: string[]) => cols.join(', '),
    },
    {
      title: '唯一',
      dataIndex: 'unique',
      key: 'unique',
      render: (unique: boolean) => (
        <Tag color={unique ? 'green' : 'default'}>{unique ? '是' : '否'}</Tag>
      ),
    },
  ];

  const foreignKeyColumns = [
    {
      title: '外键名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <Link size={14} color="#1890ff" />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: '列',
      dataIndex: 'column',
      key: 'column',
    },
    {
      title: '引用表',
      dataIndex: 'refTable',
      key: 'refTable',
    },
    {
      title: '引用列',
      dataIndex: 'refColumn',
      key: 'refColumn',
    },
    {
      title: 'ON UPDATE',
      dataIndex: 'onUpdate',
      key: 'onUpdate',
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: 'ON DELETE',
      dataIndex: 'onDelete',
      key: 'onDelete',
      render: (text: string) => <Tag>{text}</Tag>,
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Title level={5} style={{ marginBottom: 16 }}>
        表: {tableName}
      </Title>

      <Tabs defaultActiveKey="columns" size="small">
        <TabPane tab="列" key="columns">
          <Table
            dataSource={columns}
            columns={columnColumns}
            pagination={false}
            size="small"
            bordered
          />
        </TabPane>

        <TabPane tab="索引" key="indexes">
          <Table
            dataSource={indexes}
            columns={indexColumns}
            pagination={false}
            size="small"
            bordered
          />
        </TabPane>

        <TabPane tab="外键" key="foreignKeys">
          <Table
            dataSource={foreignKeys}
            columns={foreignKeyColumns}
            pagination={false}
            size="small"
            bordered
          />
        </TabPane>

        <TabPane tab="DDL" key="ddl">
          <pre style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            fontSize: 12,
            overflow: 'auto',
          }}>
{`CREATE TABLE \`${tableName}\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  \`name\` VARCHAR(100) NOT NULL COMMENT '姓名',
  \`email\` VARCHAR(255) NOT NULL COMMENT '邮箱地址',
  \`age\` INT(11) DEFAULT NULL COMMENT '年龄',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_email\` (\`email\`),
  KEY \`idx_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';`}
          </pre>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TableProperties;
