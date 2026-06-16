// GraphQL 客户端封装 - CloudBeaver API
import { GraphQLClient } from 'graphql-request';

const GRAPHQL_ENDPOINT = 'http://localhost:8978/api/gql';

export class CloudBeaverClient {
  private client: GraphQLClient;
  private sessionInitialized = false;
  private sessionPromise: Promise<void> | null = null;

  constructor(endpoint: string = GRAPHQL_ENDPOINT) {
    this.client = new GraphQLClient(endpoint, {
      headers: {},
      credentials: 'include', // 携带 session cookie
    });
  }

  /**
   * 确保会话已初始化（CloudBeaver 要求先 openSession）
   */
  private async ensureSession(): Promise<void> {
    if (this.sessionInitialized) return;

    // 避免并发重复初始化
    if (this.sessionPromise) return this.sessionPromise;

    this.sessionPromise = (async () => {
      const mutation = `
        mutation openSession {
          openSession {
            valid
          }
        }
      `;
      try {
        await this.client.request(mutation);
        this.sessionInitialized = true;
      } catch (error) {
        // 会话可能已存在，标记为已初始化避免阻塞
        this.sessionInitialized = true;
      } finally {
        this.sessionPromise = null;
      }
    })();

    return this.sessionPromise;
  }

  /**
   * 执行 GraphQL 查询
   */
  async query<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    await this.ensureSession();
    try {
      return await this.client.request<T>(query, variables);
    } catch (error: any) {
      console.error('GraphQL 查询失败:', error);
      throw new Error(error.response?.errors?.[0]?.message || error.message || 'GraphQL 请求失败');
    }
  }

  /**
   * 执行 GraphQL 变更（mutation）
   */
  async mutate<T = any>(mutation: string, variables?: Record<string, any>): Promise<T> {
    return this.query<T>(mutation, variables);
  }
}

// 导出单例实例
export const cloudBeaverClient = new CloudBeaverClient();
