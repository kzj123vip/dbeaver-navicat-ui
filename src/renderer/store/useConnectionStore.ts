// Zustand 状态管理 - 连接管理
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Connection } from '../services/api';

interface ConnectionStore {
  // 状态
  connections: Connection[];
  currentConnection: Connection | null;
  loading: boolean;
  error: string | null;

  // 操作
  setConnections: (connections: Connection[]) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (connectionId: string) => void;
  updateConnection: (connectionId: string, updates: Partial<Connection>) => void;
  selectConnection: (connectionId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      connections: [],
      currentConnection: null,
      loading: false,
      error: null,

      // 设置连接列表
      setConnections: (connections) => set({ connections }),

      // 添加连接
      addConnection: (connection) =>
        set((state) => ({
          connections: [...state.connections, connection],
        })),

      // 移除连接
      removeConnection: (connectionId) =>
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== connectionId),
          currentConnection:
            state.currentConnection?.id === connectionId ? null : state.currentConnection,
        })),

      // 更新连接
      updateConnection: (connectionId, updates) =>
        set((state) => ({
          connections: state.connections.map((c) =>
            c.id === connectionId ? { ...c, ...updates } : c
          ),
          currentConnection:
            state.currentConnection?.id === connectionId
              ? { ...state.currentConnection, ...updates }
              : state.currentConnection,
        })),

      // 选择当前连接
      selectConnection: (connectionId) => {
        const connection = get().connections.find((c) => c.id === connectionId);
        set({ currentConnection: connection || null });
      },

      // 设置加载状态
      setLoading: (loading) => set({ loading }),

      // 设置错误信息
      setError: (error) => set({ error }),

      // 清除错误信息
      clearError: () => set({ error: null }),
    }),
    {
      name: 'connection-storage', // localStorage key
      partialize: (state) => ({
        connections: state.connections,
        currentConnection: state.currentConnection,
      }),
    }
  )
);
