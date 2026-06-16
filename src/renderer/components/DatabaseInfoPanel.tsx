// 数据库信息面板 - 显示数据库统计信息
import React from 'react';
import { Card, Row, Col, Statistic, Progress, Space, Tag, Divider } from 'antd';
import {
  Database,
  Table as TableIcon,
  Eye,
  Users,
  HardDrive,
  Activity,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface DatabaseInfoPanelProps {
  databaseName?: string;
}

const DatabaseInfoPanel: React.FC<DatabaseInfoPanelProps> = ({
  databaseName = 'sakila',
}) => {
  // 模拟数据库统计信息
  const stats = {
    tables: 23,
    views: 7,
    procedures: 12,
    users: 3,
    totalSize: 156.8, // MB
    usedSize: 142.3, // MB
    freeSize: 14.5, // MB
    connections: 8,
    maxConnections: 151,
    uptime: '15天 7小时 23分钟',
    version: 'MySQL 8.0.35',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  };

  const usagePercent = Math.round((stats.usedSize / stats.totalSize) * 100);
  const connectionPercent = Math.round((stats.connections / stats.maxConnections) * 100);

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 标题 */}
        <div>
          <Space>
            <Database size={24} color="#1890ff" strokeWidth={1.5} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{databaseName}</div>
              <div style={{ fontSize: 13, color: '#999' }}>{stats.version}</div>
            </div>
          </Space>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* 对象统计 */}
        <Card title="数据库对象" size="small">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="表"
                value={stats.tables}
                prefix={<TableIcon size={16} color="#52c41a" />}
                valueStyle={{ fontSize: 20 }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="视图"
                value={stats.views}
                prefix={<Eye size={16} color="#1890ff" />}
                valueStyle={{ fontSize: 20 }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="存储过程"
                value={stats.procedures}
                prefix={<Activity size={16} color="#faad14" />}
                valueStyle={{ fontSize: 20 }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="用户"
                value={stats.users}
                prefix={<Users size={16} color="#ff7a45" />}
                valueStyle={{ fontSize: 20 }}
              />
            </Col>
          </Row>
        </Card>

        {/* 存储空间 */}
        <Card title="存储空间" size="small">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#666' }}>
                  <HardDrive size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  已使用
                </span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {stats.usedSize} MB / {stats.totalSize} MB
                </span>
              </div>
              <Progress
                percent={usagePercent}
                status={usagePercent > 90 ? 'exception' : 'active'}
                strokeColor={usagePercent > 90 ? '#ff4d4f' : '#1890ff'}
              />
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: '#52c41a' }}>
                    {stats.usedSize} MB
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>已使用</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: '#999' }}>
                    {stats.freeSize} MB
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>可用</div>
                </div>
              </Col>
            </Row>
          </Space>
        </Card>

        {/* 连接状态 */}
        <Card title="连接状态" size="small">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#666' }}>
                  <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  当前连接
                </span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {stats.connections} / {stats.maxConnections}
                </span>
              </div>
              <Progress
                percent={connectionPercent}
                status="active"
                strokeColor="#52c41a"
              />
            </div>

            <div style={{
              background: '#f5f5f5',
              padding: 12,
              borderRadius: 4,
            }}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#666' }}>
                    <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    运行时间
                  </span>
                  <span style={{ fontWeight: 500 }}>{stats.uptime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#666' }}>字符集</span>
                  <Tag color="blue">{stats.charset}</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#666' }}>排序规则</span>
                  <Tag color="cyan">{stats.collation}</Tag>
                </div>
              </Space>
            </div>
          </Space>
        </Card>

        {/* 性能指标 */}
        <Card title="性能指标" size="small">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>98.5%</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>缓存命中率</div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>1.2ms</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>平均查询时间</div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>3,247</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>今日查询数</div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#ff7a45' }}>0.03%</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>慢查询率</div>
              </div>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default DatabaseInfoPanel;
