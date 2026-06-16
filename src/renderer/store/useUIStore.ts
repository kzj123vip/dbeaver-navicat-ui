// Zustand 状态管理 - UI 状态
import { create } from 'zustand';

interface UIStore {
  // 对话框状态
  connectionDialogVisible: boolean;
  exportDialogVisible: boolean;
  queryHistoryVisible: boolean;

  // 当前选中的表
  selectedTable: string | undefined;
  selectedDatabase: string | undefined;

  // Tab 管理
  activeTabKey: string;

  // 操作
  setConnectionDialogVisible: (visible: boolean) => void;
  setExportDialogVisible: (visible: boolean) => void;
  setQueryHistoryVisible: (visible: boolean) => void;
  setSelectedTable: (table: string | undefined) => void;
  setSelectedDatabase: (database: string | undefined) => void;
  setActiveTabKey: (key: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // 初始状态
  connectionDialogVisible: false,
  exportDialogVisible: false,
  queryHistoryVisible: false,
  selectedTable: undefined,
  selectedDatabase: undefined,
  activeTabKey: 'welcome',

  // 操作
  setConnectionDialogVisible: (visible) => set({ connectionDialogVisible: visible }),
  setExportDialogVisible: (visible) => set({ exportDialogVisible: visible }),
  setQueryHistoryVisible: (visible) => set({ queryHistoryVisible: visible }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  setSelectedDatabase: (database) => set({ selectedDatabase: database }),
  setActiveTabKey: (key) => set({ activeTabKey: key }),
}));
