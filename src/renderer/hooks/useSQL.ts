// 自定义 Hook - SQL 执行和查询历史
import { useCallback } from 'react';
import { message } from 'antd';
import { useConnectionStore } from '../store/useConnectionStore';
import { useQueryHistoryStore } from '../store/useQueryHistoryStore';
import { SQLService } from '../services/api';

/**
 * SQL 执行 Hook
 */
export function useSQL() {
  const { currentConnection } = useConnectionStore();
  const { addHistory } = useQueryHistoryStore();

  /**
   * 执行 SQL
   */
  const executeSQL = useCallback(
    async (sql: string) => {
      if (!currentConnection) {
        message.error('请先选择一个数据库连接');
        return null;
      }

      const startTime = Date.now();
      try {
        const result = await SQLService.executeSQL(currentConnection.id, sql);
        const duration = Date.now() - startTime;

        // 记录到历史
        addHistory({
          sql,
          duration,
          status: 'success',
          rowsAffected: result.rowCount,
          database: currentConnection.databaseName,
          connectionId: currentConnection.id,
        });

        message.success(`查询成功，返回 ${result.rowCount} 行，耗时 ${duration}ms`);
        return result;
      } catch (err: any) {
        const duration = Date.now() - startTime;

        // 记录错误到历史
        addHistory({
          sql,
          duration,
          status: 'error',
          error: err.message,
          database: currentConnection.databaseName,
          connectionId: currentConnection.id,
        });

        message.error(`SQL 执行失败: ${err.message}`);
        throw err;
      }
    },
    [currentConnection, addHistory]
  );

  /**
   * 获取表数据（分页）
   */
  const getTableData = useCallback(
    async (
      catalog: string | undefined,
      schema: string,
      tableName: string,
      offset: number = 0,
      limit: number = 100
    ) => {
      if (!currentConnection) {
        message.error('请先选择一个数据库连接');
        return null;
      }

      try {
        const result = await SQLService.getTableData(
          currentConnection.id,
          catalog,
          schema,
          tableName,
          offset,
          limit
        );
        return result;
      } catch (err: any) {
        message.error(`加载表数据失败: ${err.message}`);
        throw err;
      }
    },
    [currentConnection]
  );

  return {
    executeSQL,
    getTableData,
    currentConnection,
  };
}
