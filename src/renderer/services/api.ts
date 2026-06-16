// API 服务层 - 封装 CloudBeaver GraphQL 操作
import { cloudBeaverClient } from './graphql-client';

// ==================== 类型定义 ====================

export interface Connection {
  id: string;
  name: string;
  driverId: string;
  host?: string;
  port?: string; // CloudBeaver 使用字符串
  databaseName?: string;
  connected: boolean;
}

export interface ConnectionConfig {
  name: string;
  driverId: string;
  host: string;
  port: string; // CloudBeaver 需要字符串类型
  databaseName: string;
  credentials?: Record<string, any>;
  providerProperties?: Record<string, any>; // MySQL 8 需要 allowPublicKeyRetrieval
  saveCredentials?: boolean;
}

export interface Database {
  name: string;
  description?: string;
}

export interface Table {
  name: string;
  type: 'TABLE' | 'VIEW' | 'SYSTEM TABLE';
  schema?: string;
  catalog?: string;
}

export interface TableColumn {
  name: string;
  dataType: string;
  typeName: string;
  nullable: boolean;
  autoIncrement: boolean;
  defaultValue?: string;
  comment?: string;
  primaryKey: boolean;
}

export interface TableIndex {
  name: string;
  type: 'PRIMARY_KEY' | 'UNIQUE' | 'INDEX';
  columns: string[];
}

export interface ForeignKey {
  name: string;
  columns: string[];
  refTable: string;
  refColumns: string[];
  deleteRule: string;
  updateRule: string;
}

export interface SQLResult {
  columns: Array<{ name: string; dataType: string }>;
  rows: any[][];
  duration: number;
  rowCount: number;
}

// ==================== 连接管理服务 ====================

export class ConnectionService {
  /**
   * 获取所有连接列表
   */
  static async getConnections(): Promise<Connection[]> {
    const query = `
      query {
        userConnections {
          id
          name
          driverId
          host
          port
          databaseName
          connected
        }
      }
    `;

    const result = await cloudBeaverClient.query<{ userConnections: Connection[] }>(query);
    return result.userConnections || [];
  }

  /**
   * 创建新连接
   */
  static async createConnection(config: ConnectionConfig): Promise<Connection> {
    const mutation = `
      mutation createConnection($config: ConnectionConfig!) {
        connection: createConnection(config: $config) {
          id
          name
          driverId
          connected
        }
      }
    `;

    const result = await cloudBeaverClient.mutate<{ connection: Connection }>(mutation, { config });
    return result.connection;
  }

  /**
   * 测试连接
   */
  static async testConnection(config: ConnectionConfig): Promise<{ success: boolean; message?: string }> {
    const mutation = `
      mutation testConnection($config: ConnectionConfig!) {
        result: testConnection(config: $config) {
          id
          connected
          connectionError {
            message
          }
        }
      }
    `;

    try {
      const result = await cloudBeaverClient.mutate<{ result: { connected: boolean; connectionError?: { message: string } } }>(
        mutation,
        { config }
      );

      if (result.result.connectionError) {
        return {
          success: false,
          message: result.result.connectionError.message,
        };
      }

      return {
        success: result.result.connected,
        message: result.result.connected ? '连接成功' : '连接失败',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '连接测试失败',
      };
    }
  }

  /**
   * 删除连接
   */
  static async deleteConnection(connectionId: string): Promise<boolean> {
    const mutation = `
      mutation deleteConnection($connectionId: ID!) {
        deleteConnection(id: $connectionId)
      }
    `;

    const result = await cloudBeaverClient.mutate<{ deleteConnection: boolean }>(mutation, { connectionId });
    return result.deleteConnection;
  }

  /**
   * 连接到数据库
   */
  static async connect(connectionId: string): Promise<boolean> {
    const mutation = `
      mutation initConnection($connectionId: ID!) {
        connection: initConnection(id: $connectionId) {
          connected
        }
      }
    `;

    const result = await cloudBeaverClient.mutate<{ connection: { connected: boolean } }>(mutation, { connectionId });
    return result.connection.connected;
  }

  /**
   * 断开连接
   */
  static async disconnect(connectionId: string): Promise<boolean> {
    const mutation = `
      mutation closeConnection($connectionId: ID!) {
        closeConnection(id: $connectionId)
      }
    `;

    const result = await cloudBeaverClient.mutate<{ closeConnection: boolean }>(mutation, { connectionId });
    return result.closeConnection;
  }
}

// ==================== 元数据查询服务 ====================

export class MetadataService {
  /**
   * 获取数据库列表
   */
  static async getDatabases(connectionId: string): Promise<Database[]> {
    const query = `
      query getDatabases($connectionId: ID!) {
        navTree(connectionId: $connectionId, path: []) {
          name
          description
        }
      }
    `;

    const result = await cloudBeaverClient.query<{ navTree: Database[] }>(query, { connectionId });
    return result.navTree || [];
  }

  /**
   * 获取表列表
   */
  static async getTables(connectionId: string, catalog?: string, schema?: string): Promise<Table[]> {
    const query = `
      query getTables($connectionId: ID!, $catalog: String, $schema: String!) {
        tables: navGetStructContainers(
          connectionId: $connectionId
          catalog: $catalog
          schema: $schema
        ) {
          name
          type
          schema
          catalog
        }
      }
    `;

    const result = await cloudBeaverClient.query<{ tables: Table[] }>(query, {
      connectionId,
      catalog,
      schema: schema || 'public',
    });
    return result.tables || [];
  }

  /**
   * 获取表的列信息
   */
  static async getTableColumns(
    connectionId: string,
    catalog: string | undefined,
    schema: string,
    tableName: string
  ): Promise<TableColumn[]> {
    // 注意：实际 API 可能不同，这里是推测
    const query = `
      query getTableColumns($connectionId: ID!, $catalog: String, $schema: String!, $table: String!) {
        columns: navNodeChildren(
          connectionId: $connectionId
          nodePath: [$catalog, $schema, $table, "columns"]
        ) {
          name
          dataType: type
          typeName
          nullable
          autoIncrement
          defaultValue
          comment
          primaryKey
        }
      }
    `;

    const result = await cloudBeaverClient.query<{ columns: TableColumn[] }>(query, {
      connectionId,
      catalog,
      schema,
      table: tableName,
    });
    return result.columns || [];
  }

  /**
   * 获取表的索引信息
   */
  static async getTableIndexes(
    connectionId: string,
    catalog: string | undefined,
    schema: string,
    tableName: string
  ): Promise<TableIndex[]> {
    // Mock 数据（实际需要根据 CloudBeaver API 调整）
    return [
      { name: 'PRIMARY', type: 'PRIMARY_KEY', columns: ['id'] },
      { name: 'idx_name', type: 'INDEX', columns: ['name'] },
    ];
  }

  /**
   * 获取表的外键信息
   */
  static async getForeignKeys(
    connectionId: string,
    catalog: string | undefined,
    schema: string,
    tableName: string
  ): Promise<ForeignKey[]> {
    // Mock 数据（实际需要根据 CloudBeaver API 调整）
    return [];
  }

  /**
   * 获取表的 DDL
   */
  static async getTableDDL(
    connectionId: string,
    catalog: string | undefined,
    schema: string,
    tableName: string
  ): Promise<string> {
    const query = `
      query getTableDDL($connectionId: ID!, $catalog: String, $schema: String!, $table: String!) {
        ddl: getTableDDL(
          connectionId: $connectionId
          catalog: $catalog
          schema: $schema
          table: $table
        )
      }
    `;

    try {
      const result = await cloudBeaverClient.query<{ ddl: string }>(query, {
        connectionId,
        catalog,
        schema,
        table: tableName,
      });
      return result.ddl || '-- DDL 不可用';
    } catch {
      return '-- DDL 查询失败';
    }
  }
}

// ==================== SQL 执行服务 ====================

export class SQLService {
  /**
   * 执行 SQL 查询
   */
  static async executeSQL(connectionId: string, sql: string): Promise<SQLResult> {
    // 先创建 SQL 上下文
    const createContextMutation = `
      mutation createContext($connectionId: ID!, $defaultCatalog: String, $defaultSchema: String) {
        context: sqlContextCreate(connectionId: $connectionId, defaultCatalog: $defaultCatalog, defaultSchema: $defaultSchema) {
          id
        }
      }
    `;

    const contextResult = await cloudBeaverClient.mutate<{ context: { id: string } }>(
      createContextMutation,
      { connectionId, defaultCatalog: null, defaultSchema: null }
    );
    const contextId = contextResult.context.id;

    // 执行异步 SQL
    const executeMutation = `
      mutation executeSQL($connectionId: ID!, $contextId: ID!, $sql: String!) {
        result: asyncSqlExecuteQuery(
          connectionId: $connectionId
          contextId: $contextId
          sql: $sql
        ) {
          id
          status
          running
        }
      }
    `;

    const executeResult = await cloudBeaverClient.mutate<{ result: { id: string } }>(
      executeMutation,
      { connectionId, contextId, sql }
    );
    const taskId = executeResult.result.id;

    // 等待执行完成并获取结果
    await new Promise(resolve => setTimeout(resolve, 1000));

    const resultsMutation = `
      mutation getResults($taskId: ID!) {
        result: asyncSqlExecuteResults(taskId: $taskId) {
          duration
          results {
            resultSet {
              id
              rows
            }
          }
        }
      }
    `;

    const result = await cloudBeaverClient.mutate<{ result: any }>(resultsMutation, {
      taskId,
    });

    const resultSet = result.result?.results?.[0]?.resultSet;
    return {
      columns: [], // TODO: 获取列信息
      rows: resultSet?.rows || [],
      duration: result.result?.duration || 0,
      rowCount: resultSet?.rows?.length || 0,
    };
  }

  /**
   * 获取表数据（分页）
   */
  static async getTableData(
    connectionId: string,
    catalog: string | undefined,
    schema: string,
    tableName: string,
    offset: number = 0,
    limit: number = 100
  ): Promise<SQLResult> {
    const fullTableName = catalog ? `${catalog}.${schema}.${tableName}` : `${schema}.${tableName}`;
    const sql = `SELECT * FROM ${fullTableName} LIMIT ${limit} OFFSET ${offset}`;

    return this.executeSQL(connectionId, sql);
  }
}

// 导出所有服务
export const api = {
  connection: ConnectionService,
  metadata: MetadataService,
  sql: SQLService,
};

export default api;
