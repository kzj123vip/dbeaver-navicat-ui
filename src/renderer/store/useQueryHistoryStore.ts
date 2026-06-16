// Zustand 状态管理 - 查询历史
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QueryHistoryItem {
  id: string;
  sql: string;
  timestamp: number; // 使用 number 便于持久化
  duration: number;
  status: 'success' | 'error';
  rowsAffected?: number;
  error?: string;
  database?: string;
  connectionId?: string;
}

interface QueryHistoryStore {
  history: QueryHistoryItem[];
  addHistory: (item: Omit<QueryHistoryItem, 'id' | 'timestamp'>) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 200; // 最多保留 200 条历史记录

export const useQueryHistoryStore = create<QueryHistoryStore>()(
  persist(
    (set) => ({
      history: [],

      addHistory: (item) =>
        set((state) => {
          const newItem: QueryHistoryItem = {
            ...item,
            id: `query_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
          };
          // 保持最新的记录在前，限制总数
          const newHistory = [newItem, ...state.history].slice(0, MAX_HISTORY);
          return { history: newHistory };
        }),

      removeHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'query-history-storage',
    }
  )
);
