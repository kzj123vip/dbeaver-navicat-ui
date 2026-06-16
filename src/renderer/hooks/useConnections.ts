// 自定义 Hook - 连接管理异步操作
import { useCallback } from 'react';
import { message } from 'antd';
import { useConnectionStore } from '../store/useConnectionStore';
import { ConnectionService, type ConnectionConfig } from '../services/api';

/**
 * 连接管理 Hook - 封装异步操作和状态更新
 */
export function useConnections() {
  const {
    connections,
    currentConnection,
    loading,
    error,
    setConnections,
    addConnection,
    removeConnection,
    selectConnection,
    setLoading,
    setError,
  } = useConnectionStore();

  /**
   * 加载连接列表
   */
  const loadConnections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ConnectionService.getConnections();
      setConnections(data);
    } catch (err: any) {
      setError(err.message);
      message.error(`加载连接失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [setConnections, setLoading, setError]);

  /**
   * 创建连接
   */
  const createConnection = useCallback(
    async (config: ConnectionConfig) => {
      setLoading(true);
      setError(null);
      try {
        const newConnection = await ConnectionService.createConnection(config);
        addConnection(newConnection);
        message.success(`连接 "${config.name}" 创建成功`);
        return newConnection;
      } catch (err: any) {
        setError(err.message);
        message.error(`创建连接失败: ${err.message}`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addConnection, setLoading, setError]
  );

  /**
   * 测试连接
   */
  const testConnection = useCallback(async (config: ConnectionConfig) => {
    const result = await ConnectionService.testConnection(config);
    if (result.success) {
      message.success('连接测试成功');
    } else {
      message.error(`连接测试失败: ${result.message}`);
    }
    return result;
  }, []);

  /**
   * 删除连接
   */
  const deleteConnection = useCallback(
    async (connectionId: string) => {
      setLoading(true);
      try {
        await ConnectionService.deleteConnection(connectionId);
        removeConnection(connectionId);
        message.success('连接已删除');
      } catch (err: any) {
        setError(err.message);
        message.error(`删除连接失败: ${err.message}`);
      } finally {
        setLoading(false);
      }
    },
    [removeConnection, setLoading, setError]
  );

  return {
    connections,
    currentConnection,
    loading,
    error,
    loadConnections,
    createConnection,
    testConnection,
    deleteConnection,
    selectConnection,
  };
}
