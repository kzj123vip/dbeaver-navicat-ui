// 查询历史面板 - 记录执行过的 SQL
import React, { useState } from 'react';
import { List, Button, Tag, Space, Tooltip, Input, Empty } from 'antd';
import { History, Clock, CheckCircle, XCircle, Copy, Play, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const { Search } = Input;

interface QueryHistoryItem {
  id: string;
  sql: string;
  timestamp: Date;
  duration: number; // 毫秒
  status: 'success' | 'error';
  rowsAffected?: number;
  error?: string;
  database?: string;
}

interface QueryHistoryPanelProps {
  onExecuteSQL?: (sql: string) => void;
}

const QueryHistoryPanel: React.FC<QueryHistoryPanelProps> = ({ onExecuteSQL }) => {
  const [searchText, setSearchText] = useState('');

  // 模拟查询历史数据
  const [historyData] = useState<QueryHistoryItem[]>([
    {
      id: '1',
      sql: 'SELECT * FROM users WHERE age > 18 ORDER BY created_at DESC LIMIT 100;',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5分钟前
      duration: 125,
      status: 'success',
      rowsAffected: 87,
      database: 'sakila',
    },
    {
      id: '2',
      sql: 'UPDATE users SET status = "active" WHERE last_login > DATE_SUB(NOW(), INTERVAL 30 DAY);',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15分钟前
      duration: 2340,
      status: 'success',
      rowsAffected: 234,
      database: 'sakila',
    },
    {
      id: '3',
      sql: 'SELECT u.name, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
      duration: 456,
      status: 'success',
      rowsAffected: 152,
      database: 'sakila',
    },
    {
      id: '4',
      sql: 'DELETE FROM temp_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1小时前
      duration: 89,
      status: 'error',
      error: 'Table \'temp_logs\' doesn\'t exist',
      database: 'test_db',
    },
    {
      id: '5',
      sql: 'CREATE INDEX idx_email ON users(email);',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
      duration: 3245,
      status: 'success',
      database: 'sakila',
    },
  ]);

  const filteredData = historyData.filter(item =>
    item.sql.toLowerCase().includes(searchText.toLowerCase()) ||
    item.database?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCopy = (sql: string) => {
    navigator.clipboard.writeText(sql);
  };

  const handleExecute = (sql: string) => {
    onExecuteSQL?.(sql);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getRelativeTime = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
    } catch {
      return '刚刚';
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 标题和搜索 */}
      <div style={{ padding: 16, borderBottom: '1px solid #e8e8e8' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <History size={20} color="#1890ff" />
              <span style={{ fontSize: 16, fontWeight: 500 }}>查询历史</span>
            </Space>
            <Tag color="blue">{historyData.length} 条</Tag>
          </div>
          <Search
            placeholder="搜索 SQL 或数据库..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
        </Space>
      </div>

      {/* 历史列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {filteredData.length === 0 ? (
          <Empty
            description="暂无查询历史"
            style={{ marginTop: 48 }}
          />
        ) : (
          <List
            dataSource={filteredData}
            renderItem={item => (
              <List.Item
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                }}
                actions={[
                  <Tooltip title="复制">
                    <Button
                      type="text"
                      size="small"
                      icon={<Copy size={14} />}
                      onClick={() => handleCopy(item.sql)}
                    />
                  </Tooltip>,
                  <Tooltip title="重新执行">
                    <Button
                      type="text"
                      size="small"
                      icon={<Play size={14} />}
                      onClick={() => handleExecute(item.sql)}
                    />
                  </Tooltip>,
                  <Tooltip title="删除">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<Trash2 size={14} />}
                    />
                  </Tooltip>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    item.status === 'success' ? (
                      <CheckCircle size={20} color="#52c41a" strokeWidth={1.5} />
                    ) : (
                      <XCircle size={20} color="#ff4d4f" strokeWidth={1.5} />
                    )
                  }
                  title={
                    <div style={{ fontSize: 13, fontFamily: 'monospace' }}>
                      {item.sql.length > 80 ? `${item.sql.slice(0, 80)}...` : item.sql}
                    </div>
                  }
                  description={
                    <Space size={8} wrap>
                      <Space size={4}>
                        <Clock size={12} />
                        <span style={{ fontSize: 12, color: '#999' }}>
                          {getRelativeTime(item.timestamp)}
                        </span>
                      </Space>
                      {item.database && (
                        <Tag color="cyan" style={{ fontSize: 11 }}>
                          {item.database}
                        </Tag>
                      )}
                      <Tag color={item.status === 'success' ? 'green' : 'red'} style={{ fontSize: 11 }}>
                        {formatDuration(item.duration)}
                      </Tag>
                      {item.status === 'success' && item.rowsAffected !== undefined && (
                        <Tag color="blue" style={{ fontSize: 11 }}>
                          {item.rowsAffected} 行
                        </Tag>
                      )}
                      {item.status === 'error' && item.error && (
                        <Tooltip title={item.error}>
                          <Tag color="red" style={{ fontSize: 11, cursor: 'pointer' }}>
                            错误
                          </Tag>
                        </Tooltip>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default QueryHistoryPanel;
