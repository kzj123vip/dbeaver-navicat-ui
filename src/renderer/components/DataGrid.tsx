// 数据表格组件 - 基于 AG Grid，Navicat 风格配色
import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './DataGrid.css';

interface DataGridProps {
  tableName?: string;
}

const DataGrid: React.FC<DataGridProps> = ({ tableName = 'users' }) => {
  // 模拟数据
  const columnDefs = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 80, sortable: true, filter: true },
    { field: 'name', headerName: '姓名', width: 150, sortable: true, filter: true },
    { field: 'email', headerName: '邮箱', width: 200, sortable: true, filter: true },
    { field: 'age', headerName: '年龄', width: 100, sortable: true, filter: true },
    { field: 'city', headerName: '城市', width: 120, sortable: true, filter: true },
    { field: 'created_at', headerName: '创建时间', width: 180, sortable: true, filter: true },
    {
      field: 'status',
      headerName: '状态',
      width: 100,
      cellRenderer: (params: any) => {
        if (params.value === null) {
          return <span style={{ color: '#999', fontStyle: 'italic' }}>[NULL]</span>;
        }
        return params.value;
      },
    },
  ], []);

  const rowData = useMemo(() => [
    { id: 1, name: '张三', email: 'zhangsan@example.com', age: 28, city: '北京', created_at: '2024-01-15 10:30:00', status: 'active' },
    { id: 2, name: '李四', email: 'lisi@example.com', age: 32, city: '上海', created_at: '2024-02-20 14:20:00', status: 'active' },
    { id: 3, name: '王五', email: 'wangwu@example.com', age: null, city: '广州', created_at: '2024-03-10 09:15:00', status: null },
    { id: 4, name: '赵六', email: 'zhaoliu@example.com', age: 45, city: '深圳', created_at: '2024-04-05 16:45:00', status: 'active' },
    { id: 5, name: '孙七', email: 'sunqi@example.com', age: 29, city: '杭州', created_at: '2024-05-12 11:00:00', status: 'inactive' },
    { id: 6, name: '周八', email: 'zhouba@example.com', age: 35, city: '成都', created_at: '2024-06-08 13:30:00', status: 'active' },
    { id: 7, name: '吴九', email: 'wujiu@example.com', age: 26, city: '武汉', created_at: '2024-07-20 15:10:00', status: null },
    { id: 8, name: '郑十', email: 'zhengshi@example.com', age: 38, city: '西安', created_at: '2024-08-15 10:50:00', status: 'active' },
  ], []);

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
            共 {rowData.length} 行
          </span>
        </div>
      </div>

      {/* AG Grid 数据表格 */}
      <div className="ag-theme-navicat" style={{ flex: 1 }}>
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
        />
      </div>
    </div>
  );
};

export default DataGrid;
