// 预加载脚本 - 安全地暴露 API 给渲染进程
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // 数据库相关 API
  getDatabaseDrivers: () => ipcRenderer.invoke('get-database-drivers'),
  createConnection: (config: any) => ipcRenderer.invoke('create-connection', config),
  testConnection: (config: any) => ipcRenderer.invoke('test-connection', config),
  executeSQL: (connectionId: string, sql: string) =>
    ipcRenderer.invoke('execute-sql', connectionId, sql),
});

// TypeScript 类型定义
declare global {
  interface Window {
    api: {
      getDatabaseDrivers: () => Promise<any[]>;
      createConnection: (config: any) => Promise<any>;
      testConnection: (config: any) => Promise<boolean>;
      executeSQL: (connectionId: string, sql: string) => Promise<any>;
    };
  }
}
