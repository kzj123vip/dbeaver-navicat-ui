// 数据表格组件 - 基于 AG Grid，Navicat 风格配色（真实数据 + 行内编辑）
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Button, Empty, Spin, message, Modal, Space, Dropdown } from 'antd';
import { RefreshCw, Save, Plus, Trash2, RotateCcw, MoreVertical, Columns, Key, Link } from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './DataGrid.css';
import { useSQL } from '../hooks/useSQL';
import { useConnectionStore } from '../store/useConnectionStore';
import AddColumnDialog, { type ColumnDefinition } from './AddColumnDialog';
import CreateIndexDialog, { type IndexDefinition } from './CreateIndexDialog';
import CreatePrimaryKeyDialog from './CreatePrimaryKeyDialog';
import CreateForeignKeyDialog, { type ForeignKeyDefinition } from './CreateForeignKeyDialog';

interface DataGridProps {
  tableName?: string;
  connectionId?: string;
  schema?: string;
}

const PAGE_SIZE = 100;

const DataGrid: React.FC<DataGridProps> = ({ tableName, connectionId, schema }) => {
  const { getTableData, executeSQL } = useSQL();
  const { currentConnection } = useConnectionStore();
  const gridRef = useRef<any>(null);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [rowData, setRowData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [primaryKey, setPrimaryKey] = useState<string>('id'); // 主键列名
  const [addColumnVisible, setAddColumnVisible] = useState(false);
  const [createIndexVisible, setCreateIndexVisible] = useState(false);
  const [createPrimaryKeyVisible, setCreatePrimaryKeyVisible] = useState(false);
  const [createForeignKeyVisible, setCreateForeignKeyVisible] = useState(false);

  /**
   * 将 SQL 结果集转换为 AG Grid 格式
   */
  const transformResult = useCallback((columns: Array<{ name: string }>, rows: any[][]) => {
    // 构建列定义（可编辑）
    const colDefs = columns.map((col) => ({
      field: col.name,
      headerName: col.name,
      sortable: true,
      filter: true,
      resizable: true,
      editable: true, // 启用单元格编辑
      cellRenderer: (params: any) => {
        if (params.value === null || params.value === undefined) {
          return <span style={{ color: '#999', fontStyle: 'italic' }}>[NULL]</span>;
        }
        return String(params.value);
      },
    }));

    // 构建行数据（数组 → 对象，添加唯一 ID）
    const rowObjects = rows.map((row, idx) => {
      const obj: Record<string, any> = { _rowId: idx };
      columns.forEach((col, colIdx) => {
        obj[col.name] = row[colIdx];
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
        setOriginalData(JSON.parse(JSON.stringify(rowObjects))); // 深拷贝保存原始数据
        setRowCount(result.rowCount);
        setHasChanges(false);
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

  /**
   * 单元格值变化时
   */
  const onCellValueChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  /**
   * 添加新行
   */
  const handleAddRow = useCallback(() => {
    const newRow: Record<string, any> = { _rowId: `new_${Date.now()}`, _isNew: true };
    columnDefs.forEach((col) => {
      newRow[col.field] = null;
    });
    setRowData([...rowData, newRow]);
    setHasChanges(true);
    message.success('已添加新行，请编辑后保存');
  }, [rowData, columnDefs]);

  /**
   * 删除选中行
   */
  const handleDeleteRows = useCallback(() => {
    const selectedNodes = gridRef.current?.api?.getSelectedNodes();
    if (!selectedNodes || selectedNodes.length === 0) {
      message.warning('请先选择要删除的行');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedNodes.length} 行吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        const selectedData = selectedNodes.map((node: any) => node.data);
        const newRowData = rowData.filter((row) => !selectedData.includes(row));
        setRowData(newRowData);
        setHasChanges(true);
        message.success(`已标记删除 ${selectedNodes.length} 行`);
      },
    });
  }, [rowData]);

  /**
   * 还原更改
   */
  const handleRevert = useCallback(() => {
    Modal.confirm({
      title: '确认还原',
      content: '确定要放弃所有未保存的更改吗？',
      okText: '还原',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setRowData(JSON.parse(JSON.stringify(originalData)));
        setHasChanges(false);
        message.success('已还原所有更改');
      },
    });
  }, [originalData]);

  /**
   * 保存更改
   */
  const handleSave = useCallback(async () => {
    if (!tableName || !hasChanges) {
      return;
    }

    setLoading(true);
    try {
      // 生成 SQL 语句
      const sqlStatements: string[] = [];

      // 找出新增的行
      const newRows = rowData.filter((row) => row._isNew);
      for (const row of newRows) {
        const columns = Object.keys(row).filter((k) => !k.startsWith('_'));
        const values = columns.map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          return String(val);
        });
        sqlStatements.push(
          `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`
        );
      }

      // 找出修改的行（简化版：对比所有非新增行）
      const existingRows = rowData.filter((row) => !row._isNew);
      for (const row of existingRows) {
        const originalRow = originalData.find((r) => r._rowId === row._rowId);
        if (!originalRow) continue;

        const changes = Object.keys(row)
          .filter((k) => !k.startsWith('_') && row[k] !== originalRow[k])
          .map((col) => {
            const val = row[col];
            if (val === null || val === undefined) return `${col} = NULL`;
            if (typeof val === 'string') return `${col} = '${val.replace(/'/g, "''")}'`;
            return `${col} = ${val}`;
          });

        if (changes.length > 0) {
          sqlStatements.push(
            `UPDATE ${tableName} SET ${changes.join(', ')} WHERE ${primaryKey} = ${row[primaryKey]};`
          );
        }
      }

      // 找出删除的行
      const deletedRows = originalData.filter(
        (origRow) => !rowData.some((r) => r._rowId === origRow._rowId)
      );
      for (const row of deletedRows) {
        sqlStatements.push(`DELETE FROM ${tableName} WHERE ${primaryKey} = ${row[primaryKey]};`);
      }

      if (sqlStatements.length === 0) {
        message.info('没有更改需要保存');
        return;
      }

      // 执行 SQL
      const sql = sqlStatements.join('\n');
      await executeSQL(sql);

      message.success('更改已保存');
      await loadData(); // 重新加载数据
    } catch (err: any) {
      message.error(`保存失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [tableName, rowData, originalData, hasChanges, primaryKey, executeSQL, loadData]);

  /**
   * 添加列
   */
  const handleAddColumn = useCallback(async (column: ColumnDefinition) => {
    if (!tableName) return;

    setLoading(true);
    try {
      // 生成 ALTER TABLE ADD COLUMN SQL
      let sql = `ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${column.type}`;

      if (column.length) {
        sql += `(${column.length})`;
      }

      if (!column.nullable) {
        sql += ' NOT NULL';
      }

      if (column.autoIncrement) {
        sql += ' AUTO_INCREMENT';
      }

      if (column.defaultValue) {
        sql += ` DEFAULT ${column.defaultValue}`;
      }

      if (column.comment) {
        sql += ` COMMENT '${column.comment.replace(/'/g, "''")}'`;
      }

      sql += ';';

      await executeSQL(sql);
      message.success(`列 "${column.name}" 已添加`);
      await loadData(); // 重新加载数据以显示新列
    } catch (err: any) {
      message.error(`添加列失败: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName, executeSQL, loadData]);

  /**
   * 创建索引
   */
  const handleCreateIndex = useCallback(async (index: IndexDefinition) => {
    if (!tableName) return;

    setLoading(true);
    try {
      // 生成 CREATE INDEX SQL
      let sql = '';
      if (index.type === 'UNIQUE') {
        sql = `CREATE UNIQUE INDEX ${index.name} ON ${tableName} (${index.columns.join(', ')});`;
      } else if (index.type === 'FULLTEXT') {
        sql = `CREATE FULLTEXT INDEX ${index.name} ON ${tableName} (${index.columns.join(', ')});`;
      } else {
        sql = `CREATE INDEX ${index.name} ON ${tableName} (${index.columns.join(', ')});`;
      }

      await executeSQL(sql);
      message.success(`索引 "${index.name}" 已创建`);
    } catch (err: any) {
      message.error(`创建索引失败: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName, executeSQL]);

  /**
   * 创建主键
   */
  const handleCreatePrimaryKey = useCallback(async (columns: string[]) => {
    if (!tableName) return;

    setLoading(true);
    try {
      const sql = `ALTER TABLE ${tableName} ADD PRIMARY KEY (${columns.join(', ')});`;
      await executeSQL(sql);
      message.success('主键已创建');
    } catch (err: any) {
      message.error(`创建主键失败: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName, executeSQL]);

  /**
   * 创建外键
   */
  const handleCreateForeignKey = useCallback(async (fk: ForeignKeyDefinition) => {
    if (!tableName) return;

    setLoading(true);
    try {
      const sql = `ALTER TABLE ${tableName} ADD CONSTRAINT ${fk.name} FOREIGN KEY (${fk.column}) REFERENCES ${fk.refTable}(${fk.refColumn}) ON DELETE ${fk.onDelete} ON UPDATE ${fk.onUpdate};`;
      await executeSQL(sql);
      message.success(`外键 "${fk.name}" 已创建`);
    } catch (err: any) {
      message.error(`创建外键失败: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName, executeSQL]);

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
          {hasChanges && (
            <span style={{ marginLeft: 16, color: '#ff4d4f', fontSize: 13 }}>
              ● 有未保存的更改
            </span>
          )}
        </div>
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<Save size={14} />}
            onClick={handleSave}
            disabled={!hasChanges}
            loading={loading}
          >
            保存
          </Button>
          <Button
            size="small"
            icon={<RotateCcw size={14} />}
            onClick={handleRevert}
            disabled={!hasChanges}
          >
            还原
          </Button>
          <Button
            size="small"
            icon={<Plus size={14} />}
            onClick={handleAddRow}
          >
            添加行
          </Button>
          <Button
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={handleDeleteRows}
          >
            删除
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'addColumn',
                  label: '添加列',
                  icon: <Columns size={14} />,
                  onClick: () => setAddColumnVisible(true),
                },
                { type: 'divider' },
                {
                  key: 'createIndex',
                  label: '创建索引',
                  icon: <Key size={14} />,
                  onClick: () => setCreateIndexVisible(true),
                },
                {
                  key: 'createPrimaryKey',
                  label: '创建主键',
                  icon: <Key size={14} />,
                  onClick: () => setCreatePrimaryKeyVisible(true),
                },
                {
                  key: 'createForeignKey',
                  label: '创建外键',
                  icon: <Link size={14} />,
                  onClick: () => setCreateForeignKeyVisible(true),
                },
              ],
            }}
          >
            <Button size="small" icon={<MoreVertical size={14} />}>
              更多
            </Button>
          </Dropdown>
          <Button
            type="text"
            size="small"
            icon={<RefreshCw size={14} />}
            onClick={loadData}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
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
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
            editable: true,
          }}
          rowSelection="multiple"
          animateRows={true}
          pagination={true}
          paginationPageSize={20}
          overlayNoRowsTemplate="<span style='color:#999'>暂无数据</span>"
          onCellValueChanged={onCellValueChanged}
          suppressClickEdit={false}
          singleClickEdit={true}
        />
      </div>

      {/* 添加列对话框 */}
      <AddColumnDialog
        visible={addColumnVisible}
        tableName={tableName || ''}
        onClose={() => setAddColumnVisible(false)}
        onAdd={handleAddColumn}
      />

      {/* 创建索引对话框 */}
      <CreateIndexDialog
        visible={createIndexVisible}
        tableName={tableName || ''}
        columns={columnDefs.map((col) => col.field)}
        onClose={() => setCreateIndexVisible(false)}
        onCreate={handleCreateIndex}
      />

      {/* 创建主键对话框 */}
      <CreatePrimaryKeyDialog
        visible={createPrimaryKeyVisible}
        tableName={tableName || ''}
        columns={columnDefs.map((col) => col.field)}
        onClose={() => setCreatePrimaryKeyVisible(false)}
        onCreate={handleCreatePrimaryKey}
      />

      {/* 创建外键对话框 */}
      <CreateForeignKeyDialog
        visible={createForeignKeyVisible}
        tableName={tableName || ''}
        columns={columnDefs.map((col) => col.field)}
        onClose={() => setCreateForeignKeyVisible(false)}
        onCreate={handleCreateForeignKey}
      />
    </div>
  );
};

export default DataGrid;
