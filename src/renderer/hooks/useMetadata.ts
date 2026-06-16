// 自定义 Hook - 元数据查询
import { useCallback, useState } from 'react';
import { message } from 'antd';
import { useConnectionStore } from '../store/useConnectionStore';
import { MetadataService, type Database, type Table, type TableColumn } from '../services/api';

/**
 * 元数据查询 Hook
 */
export function useMetadata() {
  const { currentConnection } = useConnectionStore();
  const [loading, setLoading] = useState(false);

  /**
   * 获取数据库列表
   */
  const getDatabases = useCallback(
    async (connectionId?: string) => {
      const connId = connectionId || currentConnection?.id;
      if (!connId) {
        message.error('请先选择一个连接');
        return [];
      }

      setLoading(true);
      try {
        const databases = await MetadataService.getDatabases(connId);
        return databases;
      } catch (err: any) {
        message.error(`获取数据库列表失败: ${err.message}`);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [currentConnection]
  );

  /**
   * 获取表列表
   */
  const getTables = useCallback(
    async (catalog?: string, schema?: string) => {
      if (!currentConnection) {
        message.error('请先选择一个连接');
        return [];
      }

      setLoading(true);
      try {
        const tables = await MetadataService.getTables(
          currentConnection.id,
          catalog,
          schema || 'public'
        );
        return tables;
      } catch (err: any) {
        message.error(`获取表列表失败: ${err.message}`);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [currentConnection]
  );

  /**
   * 获取表的列信息
   */
  const getTableColumns = useCallback(
    async (catalog: string | undefined, schema: string, tableName: string) => {
      if (!currentConnection) {
        message.error('请先选择一个连接');
        return [];
      }

      setLoading(true);
      try {
        const columns = await MetadataService.getTableColumns(
          currentConnection.id,
          catalog,
          schema,
          tableName
        );
        return columns;
      } catch (err: any) {
        message.error(`获取表结构失败: ${err.message}`);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [currentConnection]
  );

  /**
   * 获取表的 DDL
   */
  const getTableDDL = useCallback(
    async (catalog: string | undefined, schema: string, tableName: string) => {
      if (!currentConnection) {
        return '-- 请先选择一个连接';
      }

      setLoading(true);
      try {
        const ddl = await MetadataService.getTableDDL(
          currentConnection.id,
          catalog,
          schema,
          tableName
        );
        return ddl;
      } catch (err: any) {
        return `-- 获取 DDL 失败: ${err.message}`;
      } finally {
        setLoading(false);
      }
    },
    [currentConnection]
  );

  return {
    loading,
    getDatabases,
    getTables,
    getTableColumns,
    getTableDDL,
    currentConnection,
  };
}
