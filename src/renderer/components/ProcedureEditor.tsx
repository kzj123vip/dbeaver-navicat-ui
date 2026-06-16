// 存储过程编辑器组件
import React, { useState, useEffect } from 'react';
import { Button, Space, Input, message, Spin, Empty, List, Modal } from 'antd';
import { Play, Save, Trash2, Plus, Code } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useSQL } from '../hooks/useSQL';
import { useConnectionStore } from '../store/useConnectionStore';
import { MetadataService } from '../services/api';

interface ProcedureEditorProps {
  onClose?: () => void;
}

interface Procedure {
  name: string;
  definition?: string;
}

const ProcedureEditor: React.FC<ProcedureEditorProps> = ({ onClose }) => {
  const { executeSQL, currentConnection } = useConnectionStore();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  // 加载存储过程列表
  useEffect(() => {
    const loadProcedures = async () => {
      if (!currentConnection) return;

      setLoading(true);
      try {
        // 查询存储过程列表
        const sql = `
          SELECT ROUTINE_NAME as name
          FROM INFORMATION_SCHEMA.ROUTINES
          WHERE ROUTINE_SCHEMA = DATABASE()
          AND ROUTINE_TYPE = 'PROCEDURE'
          ORDER BY ROUTINE_NAME;
        `;
        const result = await executeSQL(sql);
        if (result) {
          const procs = result.rows.map((row: any) => ({
            name: row[0],
          }));
          setProcedures(procs);
        }
      } catch (err) {
        console.error('加载存储过程失败:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProcedures();
  }, [currentConnection, executeSQL]);

  // 加载存储过程定义
  const handleSelectProcedure = async (proc: Procedure) => {
    setSelectedProcedure(proc);
    setLoading(true);
    try {
      const sql = `SHOW CREATE PROCEDURE ${proc.name};`;
      const result = await executeSQL(sql);
      if (result && result.rows.length > 0) {
        // 结果的第三列是 CREATE PROCEDURE 语句
        const definition = result.rows[0][2];
        setCode(definition || '');
      }
    } catch (err: any) {
      message.error(`加载存储过程失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 保存存储过程
  const handleSave = async () => {
    if (!code.trim()) {
      message.warning('请输入存储过程代码');
      return;
    }

    setExecuting(true);
    try {
      // 删除旧的存储过程（如果存在）
      if (selectedProcedure) {
        await executeSQL(`DROP PROCEDURE IF EXISTS ${selectedProcedure.name};`);
      }

      // 创建新的存储过程
      await executeSQL(code);
      message.success('存储过程已保存');

      // 重新加载列表
      const sql = `
        SELECT ROUTINE_NAME as name
        FROM INFORMATION_SCHEMA.ROUTINES
        WHERE ROUTINE_SCHEMA = DATABASE()
        AND ROUTINE_TYPE = 'PROCEDURE'
        ORDER BY ROUTINE_NAME;
      `;
      const result = await executeSQL(sql);
      if (result) {
        const procs = result.rows.map((row: any) => ({
          name: row[0],
        }));
        setProcedures(procs);
      }
    } catch (err: any) {
      message.error(`保存存储过程失败: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  // 删除存储过程
  const handleDelete = () => {
    if (!selectedProcedure) {
      message.warning('请先选择一个存储过程');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除存储过程 "${selectedProcedure.name}" 吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setExecuting(true);
        try {
          await executeSQL(`DROP PROCEDURE ${selectedProcedure.name};`);
          message.success('存储过程已删除');
          setSelectedProcedure(null);
          setCode('');

          // 重新加载列表
          setProcedures(procedures.filter((p) => p.name !== selectedProcedure.name));
        } catch (err: any) {
          message.error(`删除存储过程失败: ${err.message}`);
        } finally {
          setExecuting(false);
        }
      },
    });
  };

  // 新建存储过程
  const handleNew = () => {
    setSelectedProcedure(null);
    setCode(`CREATE PROCEDURE new_procedure()
BEGIN
  -- 在这里编写存储过程代码
  SELECT 'Hello, World!';
END`);
  };

  // 执行存储过程
  const handleExecute = async () => {
    if (!selectedProcedure) {
      message.warning('请先保存存储过程');
      return;
    }

    setExecuting(true);
    try {
      await executeSQL(`CALL ${selectedProcedure.name}();`);
      message.success('存储过程执行成功');
    } catch (err: any) {
      message.error(`执行存储过程失败: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  if (!currentConnection) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="请先选择一个数据库连接" />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      {/* 左侧列表 */}
      <div style={{ width: 250, borderRight: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8e8e8', background: '#fafafa' }}>
          <Space>
            <strong style={{ fontSize: 14 }}>存储过程</strong>
            <Button type="text" size="small" icon={<Plus size={14} />} onClick={handleNew}>
              新建
            </Button>
          </Space>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {loading && procedures.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <Spin />
            </div>
          ) : procedures.length === 0 ? (
            <Empty description="暂无存储过程" style={{ marginTop: 48 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              dataSource={procedures}
              renderItem={(proc) => (
                <List.Item
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: selectedProcedure?.name === proc.name ? '#e6f7ff' : 'transparent',
                  }}
                  onClick={() => handleSelectProcedure(proc)}
                >
                  <Code size={14} style={{ marginRight: 8 }} />
                  {proc.name}
                </List.Item>
              )}
            />
          )}
        </div>
      </div>

      {/* 右侧编辑器 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 工具栏 */}
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #e8e8e8', background: '#fafafa' }}>
          <Space>
            <Button
              type="primary"
              icon={<Save size={16} />}
              onClick={handleSave}
              loading={executing}
            >
              保存
            </Button>
            <Button
              icon={<Play size={16} />}
              onClick={handleExecute}
              loading={executing}
              disabled={!selectedProcedure}
            >
              执行
            </Button>
            <Button
              danger
              icon={<Trash2 size={16} />}
              onClick={handleDelete}
              disabled={!selectedProcedure}
            >
              删除
            </Button>
          </Space>
        </div>

        {/* Monaco 编辑器 */}
        <div style={{ flex: 1 }}>
          {loading && selectedProcedure ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Spin tip="加载中..." />
            </div>
          ) : (
            <Editor
              height="100%"
              defaultLanguage="sql"
              theme="vs"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 2,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcedureEditor;
