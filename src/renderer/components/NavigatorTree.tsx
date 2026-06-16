// 左侧导航树组件 - 连接和数据库对象管理
import React, { useState } from 'react';
import { Tree, Button, Dropdown, Menu } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import {
  Database,
  Folder,
  Table2,
  Eye,
  FunctionSquare,
  Users,
  Key,
  Calendar,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface NavigatorTreeProps {
  onSelectTable?: (tableName: string) => void;
}

const NavigatorTree: React.FC<NavigatorTreeProps> = ({ onSelectTable }) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['conn-1', 'db-1']);

  // 模拟数据：连接列表
  const treeData: DataNode[] = [
    {
      title: 'MySQL - 本地开发',
      key: 'conn-1',
      icon: <Database size={16} color="#4CAF50" />,
      children: [
        {
          title: 'sakila',
          key: 'db-1',
          icon: <Database size={16} color="#4CAF50" />,
          children: [
            {
              title: '表',
              key: 'tables-1',
              icon: <Folder size={16} color="#FFC107" />,
              children: [
                { title: 'actor', key: 'table-actor', icon: <Table2 size={14} color="#2196F3" /> },
                { title: 'address', key: 'table-address', icon: <Table2 size={14} color="#2196F3" /> },
                { title: 'category', key: 'table-category', icon: <Table2 size={14} color="#2196F3" /> },
                { title: 'city', key: 'table-city', icon: <Table2 size={14} color="#2196F3" /> },
                { title: 'customer', key: 'table-customer', icon: <Table2 size={14} color="#2196F3" /> },
                { title: 'film', key: 'table-film', icon: <Table2 size={14} color="#2196F3" /> },
                { title: 'film_actor', key: 'table-film_actor', icon: <Table2 size={14} color="#2196F3" /> },
              ],
            },
            {
              title: '视图',
              key: 'views-1',
              icon: <Folder size={16} color="#FFC107" />,
              children: [
                { title: 'customer_list', key: 'view-customer_list', icon: <Eye size={14} color="#2196F3" /> },
                { title: 'film_list', key: 'view-film_list', icon: <Eye size={14} color="#2196F3" /> },
              ],
            },
            {
              title: '存储过程',
              key: 'procedures-1',
              icon: <Folder size={16} color="#FFC107" />,
              children: [
                { title: 'film_in_stock', key: 'proc-1', icon: <FunctionSquare size={14} color="#FF9800" /> },
                { title: 'film_not_in_stock', key: 'proc-2', icon: <FunctionSquare size={14} color="#FF9800" /> },
              ],
            },
            {
              title: '用户',
              key: 'users-1',
              icon: <Folder size={16} color="#FFC107" />,
              children: [
                { title: 'root@localhost', key: 'user-1', icon: <Users size={14} color="#FF9800" /> },
              ],
            },
          ],
        },
        {
          title: 'test_db',
          key: 'db-2',
          icon: <Database size={16} color="#4CAF50" />,
        },
      ],
    },
    {
      title: 'PostgreSQL - 生产环境',
      key: 'conn-2',
      icon: <Database size={16} color="#336791" />,
      children: [
        {
          title: 'public',
          key: 'schema-1',
          icon: <Database size={16} color="#336791" />,
          children: [
            {
              title: '表',
              key: 'tables-2',
              icon: <Folder size={16} color="#FFC107" />,
              children: [
                { title: 'users', key: 'table-users', icon: <Table2 size={14} color="#2196F3" /> },
                { title: 'orders', key: 'table-orders', icon: <Table2 size={14} color="#2196F3" /> },
                { title: 'products', key: 'table-products', icon: <Table2 size={14} color="#2196F3" /> },
              ],
            },
          ],
        },
      ],
    },
  ];

  const handleSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    const key = selectedKeys[0] as string;
    if (key?.startsWith('table-')) {
      const tableName = info.node.title as string;
      onSelectTable?.(tableName);
    }
  };

  const contextMenu = (
    <Menu
      items={[
        { key: 'open', label: '打开', icon: <Table2 size={14} /> },
        { key: 'refresh', label: '刷新', icon: <RefreshCw size={14} /> },
        { type: 'divider' },
        { key: 'new', label: '新建表', icon: <Plus size={14} /> },
        { key: 'delete', label: '删除', icon: <Trash2 size={14} />, danger: true },
      ]}
    />
  );

  return (
    <div style={{ padding: '16px 8px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>连接</h3>
        <Button type="text" size="small" icon={<Plus size={14} />} />
      </div>

      <Dropdown overlay={contextMenu} trigger={['contextMenu']}>
        <div>
          <Tree
            showIcon
            expandedKeys={expandedKeys}
            onExpand={keys => setExpandedKeys(keys)}
            onSelect={handleSelect}
            treeData={treeData}
            style={{ background: 'transparent' }}
          />
        </div>
      </Dropdown>
    </div>
  );
};

export default NavigatorTree;
