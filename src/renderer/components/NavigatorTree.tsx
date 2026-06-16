// 左侧导航树组件 - 连接和数据库对象管理（懒加载真实数据）
import React, { useState, useEffect, useCallback } from 'react';
import { Tree, Button, Dropdown, Empty, Spin, Modal, message } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import {
  Database,
  Folder,
  Table2,
  Eye,
  FunctionSquare,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useConnections } from '../hooks/useConnections';
import { useConnectionStore } from '../store/useConnectionStore';
import { MetadataService } from '../services/api';

interface NavigatorTreeProps {
  onSelectTable?: (tableName: string, connectionId: string) => void;
  onNewConnection?: () => void;
}

/**
 * 构建连接节点（顶层）
 */
function buildConnectionNode(id: string, name: string, driverId: string): DataNode {
  // 根据驱动选择图标颜色
  const color = driverId?.includes('postgres') ? '#336791' : '#4CAF50';
  return {
    title: name,
    key: `conn:${id}`,
    icon: <Database size={16} color={color} />,
  };
}

const NavigatorTree: React.FC<NavigatorTreeProps> = ({ onSelectTable, onNewConnection }) => {
  const { connections, loadConnections, deleteConnection } = useConnections();
  const { selectConnection } = useConnectionStore();
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);

  // 初始加载连接列表
  useEffect(() => {
    setLoading(true);
    loadConnections().finally(() => setLoading(false));
  }, [loadConnections]);

  // 连接列表变化时，更新树的顶层节点
  useEffect(() => {
    setTreeData(
      connections.map((conn) => buildConnectionNode(conn.id, conn.name, conn.driverId))
    );
  }, [connections]);

  /**
   * 懒加载子节点
   */
  const onLoadData = useCallback(
    async (node: DataNode): Promise<void> => {
      const key = node.key as string;

      // 已有子节点，跳过
      if (node.children && node.children.length > 0) {
        return;
      }

      try {
        // 连接节点 → 加载数据库列表
        if (key.startsWith('conn:')) {
          const connectionId = key.slice('conn:'.length);
          selectConnection(connectionId);
          const databases = await MetadataService.getDatabases(connectionId);
          const children: DataNode[] = databases.map((db) => ({
            title: db.name,
            key: `db:${connectionId}:${db.name}`,
            icon: <Database size={16} color="#4CAF50" />,
          }));
          updateTreeNode(key, children.length ? children : [emptyNode(key)]);
        }
        // 数据库节点 → 加载表/视图分组
        else if (key.startsWith('db:')) {
          const [, connectionId, dbName] = key.split(':');
          const children: DataNode[] = [
            {
              title: '表',
              key: `tables:${connectionId}:${dbName}`,
              icon: <Folder size={16} color="#FFC107" />,
            },
            {
              title: '视图',
              key: `views:${connectionId}:${dbName}`,
              icon: <Folder size={16} color="#FFC107" />,
            },
          ];
          updateTreeNode(key, children);
        }
        // 表分组节点 → 加载表列表
        else if (key.startsWith('tables:')) {
          const [, connectionId, dbName] = key.split(':');
          const tables = await MetadataService.getTables(connectionId, undefined, dbName);
          const tableList = tables.filter((t) => t.type === 'TABLE');
          const children: DataNode[] = tableList.map((t) => ({
            title: t.name,
            key: `table:${connectionId}:${dbName}:${t.name}`,
            icon: <Table2 size={14} color="#2196F3" />,
            isLeaf: true,
          }));
          updateTreeNode(key, children.length ? children : [emptyNode(key)]);
        }
        // 视图分组节点 → 加载视图列表
        else if (key.startsWith('views:')) {
          const [, connectionId, dbName] = key.split(':');
          const tables = await MetadataService.getTables(connectionId, undefined, dbName);
          const viewList = tables.filter((t) => t.type === 'VIEW');
          const children: DataNode[] = viewList.map((t) => ({
            title: t.name,
            key: `view:${connectionId}:${dbName}:${t.name}`,
            icon: <Eye size={14} color="#2196F3" />,
            isLeaf: true,
          }));
          updateTreeNode(key, children.length ? children : [emptyNode(key)]);
        }
      } catch (err) {
        updateTreeNode(key, [emptyNode(key)]);
      }
    },
    [selectConnection]
  );

  /**
   * 更新指定节点的子节点
   */
  const updateTreeNode = (key: string, children: DataNode[]) => {
    setTreeData((origin) => updateNodeChildren(origin, key, children));
  };

  const handleSelect: TreeProps['onSelect'] = (keys, info) => {
    setSelectedKeys(keys);
    const key = keys[0] as string;
    if (key?.startsWith('table:')) {
      const [, connectionId, , tableName] = key.split(':');
      selectConnection(connectionId);
      onSelectTable?.(tableName, connectionId);
    }
  };

  const handleRefresh = () => {
    setExpandedKeys([]);
    setLoading(true);
    loadConnections().finally(() => setLoading(false));
  };

  const handleDelete = async () => {
    const key = selectedKeys[0] as string;
    if (!key || !key.startsWith('conn:')) {
      message.warning('请选择要删除的连接');
      return;
    }

    const connectionId = key.replace('conn:', '');
    const conn = connections.find(c => c.id === connectionId);

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除连接 "${conn?.name}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await deleteConnection(connectionId);
      },
    });
  };

  const contextMenuItems = {
    items: [
      { key: 'open', label: '打开', icon: <Table2 size={14} /> },
      { key: 'refresh', label: '刷新', icon: <RefreshCw size={14} /> },
      { type: 'divider' as const },
      { key: 'new', label: '新建连接', icon: <Plus size={14} /> },
      { key: 'delete', label: '删除', icon: <Trash2 size={14} />, danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'refresh') handleRefresh();
      if (key === 'new') onNewConnection?.();
      if (key === 'delete') handleDelete();
    },
  };

  return (
    <div style={{ padding: '16px 8px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>连接</h3>
        <div>
          <Button type="text" size="small" icon={<RefreshCw size={14} />} onClick={handleRefresh} />
          <Button type="text" size="small" icon={<Plus size={14} />} onClick={onNewConnection} />
        </div>
      </div>

      {loading && treeData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <Spin />
        </div>
      ) : treeData.length === 0 ? (
        <Empty
          description="暂无连接"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: 48 }}
        >
          <Button type="primary" size="small" icon={<Plus size={14} />} onClick={onNewConnection}>
            新建连接
          </Button>
        </Empty>
      ) : (
        <Dropdown menu={contextMenuItems} trigger={['contextMenu']}>
          <div>
            <Tree
              showIcon
              loadData={onLoadData}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys)}
              selectedKeys={selectedKeys}
              onSelect={handleSelect}
              treeData={treeData}
              style={{ background: 'transparent' }}
            />
          </div>
        </Dropdown>
      )}
    </div>
  );
};

/**
 * 空占位节点
 */
function emptyNode(parentKey: string): DataNode {
  return {
    title: '(空)',
    key: `${parentKey}:empty`,
    isLeaf: true,
    selectable: false,
    icon: <span />,
  };
}

/**
 * 递归更新树节点的子节点
 */
function updateNodeChildren(nodes: DataNode[], key: string, children: DataNode[]): DataNode[] {
  return nodes.map((node) => {
    if (node.key === key) {
      return { ...node, children };
    }
    if (node.children) {
      return { ...node, children: updateNodeChildren(node.children, key, children) };
    }
    return node;
  });
}

export default NavigatorTree;
