// SQL 编辑器组件 - 基于 Monaco Editor
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button, Space, message } from 'antd';
import { Play, Save, Download, Copy } from 'lucide-react';

interface SQLEditorProps {
  initialValue?: string;
  onExecute?: (sql: string) => void;
}

const SQLEditor: React.FC<SQLEditorProps> = ({
  initialValue = '-- 输入 SQL 查询\nSELECT * FROM users WHERE id = 1;',
  onExecute
}) => {
  const [sqlCode, setSqlCode] = useState(initialValue);

  const handleExecute = () => {
    if (!sqlCode.trim()) {
      message.warning('请输入 SQL 语句');
      return;
    }
    message.success('执行 SQL...');
    onExecute?.(sqlCode);
  };

  const handleSave = () => {
    message.success('SQL 已保存');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    message.success('已复制到剪贴板');
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
          >
            执行 (F5)
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
        </Space>
      </div>

      {/* Monaco 编辑器 */}
      <div style={{ flex: 1 }}>
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
            // Navicat 风格配色（通过自定义主题实现）
          }}
          onMount={(editor, monaco) => {
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

            // 快捷键：F5 执行
            editor.addCommand(monaco.KeyCode.F5, () => {
              handleExecute();
            });
          }}
        />
      </div>
    </div>
  );
};

export default SQLEditor;
