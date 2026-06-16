// SQL 编辑器组件 - 基于 Monaco Editor（真实 SQL 执行）
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button, Space, message, Spin, Empty } from 'antd';
import { Play, Save, Download, Copy, Code } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import { format } from 'sql-formatter';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../components/DataGrid.css';
import { useSQL } from '../hooks/useSQL';
import { useConnectionStore } from '../store/useConnectionStore';

interface SQLEditorProps {
  initialValue?: string;
  onExecute?: (sql: string) => void;
}

const SQLEditor: React.FC<SQLEditorProps> = ({
  initialValue = '-- 输入 SQL 查询\nSELECT * FROM users WHERE id = 1;',
  onExecute
}) => {
  const [sqlCode, setSqlCode] = useState(initialValue);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [resultColumns, setResultColumns] = useState<any[]>([]);
  const [resultRows, setResultRows] = useState<any[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const { executeSQL, currentConnection } = useSQL();

  const handleExecute = async () => {
    // 获取选中文本或全部代码
    let sqlToExecute = sqlCode.trim();
    if (editorInstance) {
      const selection = editorInstance.getSelection();
      const selectedText = editorInstance.getModel()?.getValueInRange(selection);
      if (selectedText && selectedText.trim()) {
        sqlToExecute = selectedText.trim();
      }
    }

    if (!sqlToExecute) {
      message.warning('请输入 SQL 语句');
      return;
    }

    if (!currentConnection) {
      message.error('请先选择一个数据库连接');
      return;
    }

    setExecuting(true);
    try {
      const result = await executeSQL(sqlToExecute);
      if (result) {
        // 转换为 AG Grid 格式
        const colDefs = result.columns.map((col) => ({
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

        const rowObjects = result.rows.map((row) => {
          const obj: Record<string, any> = {};
          result.columns.forEach((col, idx) => {
            obj[col.name] = row[idx];
          });
          return obj;
        });

        setResultColumns(colDefs);
        setResultRows(rowObjects);
        setExecutionTime(result.duration);
      }
      onExecute?.(sqlToExecute);
    } catch (err) {
      // 错误已在 hook 中处理
      setResultColumns([]);
      setResultRows([]);
    } finally {
      setExecuting(false);
    }
  };

  const handleSave = () => {
    message.success('SQL 已保存');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    message.success('已复制到剪贴板');
  };

  const handleFormat = () => {
    try {
      const formatted = format(sqlCode, {
        language: 'mysql',
        indent: '  ',
        uppercase: true,
        linesBetweenQueries: 2,
      });
      setSqlCode(formatted);
      message.success('SQL 已格式化');
    } catch (err: any) {
      message.error(`格式化失败: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 工具栏 */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid #e8e8e8',
        background: '#fafafa'
      }}>
        <Space>
          <Button
            type="primary"
            icon={<Play size={16} />}
            onClick={handleExecute}
            loading={executing}
            title="执行选中的 SQL 或全部（F5 或 Ctrl+Shift+E）"
          >
            执行 (F5)
          </Button>
          <Button icon={<Code size={16} />} onClick={handleFormat} title="格式化 SQL（Ctrl+Shift+F）">
            格式化
          </Button>
          <Button icon={<Save size={16} />} onClick={handleSave}>
            保存
          </Button>
          <Button icon={<Copy size={16} />} onClick={handleCopy}>
            复制
          </Button>
          <Button icon={<Download size={16} />}>
            导出
          </Button>
          {currentConnection && (
            <span style={{ marginLeft: 16, color: '#666', fontSize: 13 }}>
              连接: {currentConnection.name}
            </span>
          )}
        </Space>
      </div>

      {/* Monaco 编辑器 */}
      <div style={{ flex: '0 0 40%', minHeight: 200, borderBottom: '1px solid #e8e8e8' }}>
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs"
          value={sqlCode}
          onChange={(value) => setSqlCode(value || '')}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 2,
          }}
          onMount={(editor, monaco) => {
            // 保存编辑器实例
            setEditorInstance(editor);

            // 定义 Navicat 风格主题
            monaco.editor.defineTheme('navicat-light', {
              base: 'vs',
              inherit: true,
              rules: [
                { token: 'keyword.sql', foreground: '0066CC', fontStyle: 'bold' },
                { token: 'string.sql', foreground: '008000' },
                { token: 'comment', foreground: '808080', fontStyle: 'italic' },
                { token: 'number', foreground: '098658' },
              ],
              colors: {
                'editor.background': '#FFFFFF',
                'editor.foreground': '#333333',
                'editor.lineHighlightBackground': '#F5F7FA',
                'editorCursor.foreground': '#0066CC',
                'editor.selectionBackground': '#E3F2FD',
              },
            });
            monaco.editor.setTheme('navicat-light');

            // 快捷键：F5 执行（全部或选中）
            editor.addCommand(monaco.KeyCode.F5, () => {
              handleExecute();
            });

            // 快捷键：Ctrl+Shift+E 执行选中文本
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyE, () => {
              handleExecute();
            });

            // 快捷键：Ctrl+Shift+F 格式化 SQL
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
              handleFormat();
            });
          }}
        />
      </div>

      {/* 结果集 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 结果集工具栏 */}
        <div style={{
          padding: '8px 16px',
          background: '#fafafa',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            查询结果
          </span>
          {resultRows.length > 0 && (
            <span style={{ fontSize: 13, color: '#999' }}>
              {resultRows.length} 行，耗时 {executionTime}ms
            </span>
          )}
        </div>

        {/* 结果集表格 */}
        <div className="ag-theme-navicat" style={{ flex: 1, position: 'relative' }}>
          {executing ? (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
            }}>
              <Spin tip="执行中..." />
            </div>
          ) : resultColumns.length === 0 ? (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Empty description="执行 SQL 查询以显示结果" />
            </div>
          ) : (
            <AgGridReact
              columnDefs={resultColumns}
              rowData={resultRows}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true,
              }}
              rowSelection="multiple"
              animateRows={true}
              pagination={true}
              paginationPageSize={50}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SQLEditor;
