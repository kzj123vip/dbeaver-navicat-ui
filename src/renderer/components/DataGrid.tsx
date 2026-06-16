// 数据表格组件 - 基于 AG Grid，Navicat 风格配色（真实数据）
import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Button, Empty, Spin, message } from 'antd';
import { RefreshCw } from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './DataGrid.css';
import { useSQL } from '../hooks/useSQL';
import { useConnectionStore } from '../store/useConnectionStore';

interface DataGridProps {
  tableName?: string;
  connectionId?: string;
  schema?: string;
}

const PAGE_SIZE = 100;

const DataGrid: React.FC<DataGridProps> = ({ tableName, connectionId, schema }) => {
  const { getTableData } = useSQL();
  const { currentConnection } = useConnectionStore();
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  /**
   * 将 SQL 结果集转换为 AG Grid 格式
   */
  const transformResult = useCallback((columns: Array<{ name: string }>, rows: any[][]) => {
    // 构建列定义
    const colDefs = columns.map((col) => ({
      field: col.name,
      headerName: col.name,
      sortable: true,
      filter: true,
      resizable: true,
      cellRenderer: (params: any) => {
        if (params.value === null || params.value === undefined) {
          return <span style={{ color: '#999', fontStyle: 'italic' }}>[NULL]</span>;
        }
        return String(params.value);
      },
    }));

    // 构建行数据（数组 → 对象）
    const rowObjects = rows.map((row) => {
      const obj: Record<string, any> = {};
      columns.forEach((col, idx) => {
        obj[col.name] = row[idx];
      });
      return obj;
    });

    return { colDefs, rowObjects };
  }, []);

  /**
   * 加载表数据
   */
  const loadData = useCallback(async () => {
    if (!tableName || !currentConnection) {
      return;
    }

    setLoading(true);
    try {
      const result = await getTableData(undefined, schema || 'public', tableName, 0, PAGE_SIZE);
      if (result) {
        const { colDefs, rowObjects } = transformResult(result.columns, result.rows);
        setColumnDefs(colDefs);
        setRowData(rowObjects);
        setRowCount(result.rowCount);
      }
    } catch (err) {
      // 错误已在 hook 中处理
    } finally {
      setLoading(false);
    }
  }, [tableName, currentConnection, schema, getTableData, transformResult]);

  // 表名或连接变化时加载数据
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 没有选择连接时的空状态
  if (!currentConnection) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="请先选择一个数据库连接" />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 表头信息 */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e8e8e8',
        background: '#fafafa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong style={{ fontSize: 14 }}>表: {tableName}</strong>
          <span style={{ marginLeft: 16, color: '#999', fontSize: 13 }}>
            共 {rowCount} 行{rowCount >= PAGE_SIZE ? `（显示前 ${PAGE_SIZE} 行）` : ''}
          </span>
        </div>
        <Button
          type="text"
          size="small"
          icon={<RefreshCw size={14} />}
          onClick={loadData}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      {/* AG Grid 数据表格 */}
      <div className="ag-theme-navicat" style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.6)',
            zIndex: 10,
          }}>
            <Spin tip="加载中..." />
          </div>
        )}
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
          }}
          rowSelection="multiple"
          animateRows={true}
          pagination={true}
          paginationPageSize={20}
          overlayNoRowsTemplate="<span style='color:#999'>暂无数据</span>"
        />
      </div>
    </div>
  );
};

export default DataGrid;
