// 查询历史面板 - 记录执行过的 SQL（持久化存储）
import React, { useState } from 'react';
import { List, Button, Tag, Space, Tooltip, Input, Empty, Popconfirm } from 'antd';
import { History, Clock, CheckCircle, XCircle, Copy, Play, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useQueryHistoryStore } from '../store/useQueryHistoryStore';

const { Search } = Input;

interface QueryHistoryPanelProps {
  onExecuteSQL?: (sql: string) => void;
}

const QueryHistoryPanel: React.FC<QueryHistoryPanelProps> = ({ onExecuteSQL }) => {
  const [searchText, setSearchText] = useState('');
  const { history, removeHistory, clearHistory } = useQueryHistoryStore();

  const filteredData = history.filter(item =>
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

  const getRelativeTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: zhCN });
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
            <Space>
              <Tag color="blue">{history.length} 条</Tag>
              {history.length > 0 && (
                <Popconfirm
                  title="清空所有历史记录？"
                  onConfirm={clearHistory}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="text" size="small" danger icon={<Trash2 size={14} />} />
                </Popconfirm>
              )}
            </Space>
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
            description={history.length === 0 ? '暂无查询历史' : '无匹配结果'}
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
                      onClick={() => removeHistory(item.id)}
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
