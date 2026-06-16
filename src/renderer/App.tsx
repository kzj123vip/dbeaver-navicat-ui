// React 主组件 - Navicat 风格界面
import React, { useState } from 'react';
import { Layout, Space, Button, Typography, Tabs } from 'antd';
import {
  Database,
  FileText,
  Table2,
  Eye,
  FunctionSquare,
  Users,
  History,
  Shield,
  Network,
  BarChart3,
} from 'lucide-react';
import NavigatorTree from './components/NavigatorTree';
import SQLEditor from './components/SQLEditor';
import DataGrid from './components/DataGrid';
import ConnectionDialog from './components/ConnectionDialog';
import TableProperties from './components/TableProperties';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

type TabType = 'welcome' | 'table' | 'sql';

interface TabItem {
  key: string;
  title: string;
  type: TabType;
  tableName?: string;
}

function App() {
  const [tabs, setTabs] = useState<TabItem[]>([
    { key: 'welcome', title: '欢迎', type: 'welcome' }
  ]);
  const [activeKey, setActiveKey] = useState('welcome');
  const [connectionDialogVisible, setConnectionDialogVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | undefined>(undefined);

  const handleNewConnection = () => {
    setConnectionDialogVisible(true);
  };

  const handleSaveConnection = (connection: any) => {
    console.log('保存连接:', connection);
    // TODO: 保存到后端
  };

  const handleNewQuery = () => {
    const newKey = `sql-${Date.now()}`;
    const newTab: TabItem = {
      key: newKey,
      title: 'SQL 查询',
      type: 'sql',
    };
    setTabs([...tabs, newTab]);
    setActiveKey(newKey);
  };

  const handleSelectTable = (tableName: string) => {
    setSelectedTable(tableName);

    const existingTab = tabs.find(t => t.type === 'table' && t.tableName === tableName);
    if (existingTab) {
      setActiveKey(existingTab.key);
    } else {
      const newKey = `table-${Date.now()}`;
      const newTab: TabItem = {
        key: newKey,
        title: tableName,
        type: 'table',
        tableName,
      };
      setTabs([...tabs, newTab]);
      setActiveKey(newKey);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    const tab = tabs.find(t => t.key === key);
    if (tab?.type === 'table') {
      setSelectedTable(tab.tableName);
    } else {
      setSelectedTable(undefined);
    }
  };

  const handleTabEdit = (targetKey: any, action: 'add' | 'remove') => {
    if (action === 'remove' && targetKey !== 'welcome') {
      const newTabs = tabs.filter(t => t.key !== targetKey);
      setTabs(newTabs);
      if (activeKey === targetKey) {
        const newActiveKey = newTabs[newTabs.length - 1]?.key || 'welcome';
        setActiveKey(newActiveKey);
        const tab = newTabs.find(t => t.key === newActiveKey);
        setSelectedTable(tab?.type === 'table' ? tab.tableName : undefined);
      }
    }
  };

  const handleExecuteSQL = (sql: string) => {
    console.log('执行 SQL:', sql);
    // TODO: 调用后端执行
  };

  const renderTabContent = (tab: TabItem) => {
    switch (tab.type) {
      case 'table':
        return <DataGrid tableName={tab.tableName} />;
      case 'sql':
        return <SQLEditor onExecute={handleExecuteSQL} />;
      default:
        return (
          <div style={{ textAlign: 'center', paddingTop: 100 }}>
            <Database size={80} color="#ccc" strokeWidth={1} />
            <Title level={3} style={{ color: '#999', marginTop: 24 }}>
              欢迎使用 DBeaver Navicat Edition
            </Title>
            <p style={{ color: '#999' }}>开始创建数据库连接或打开表</p>
          </div>
        );
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Navicat 风格顶部工具栏 */}
      <Header
        style={{
          background: '#fff',
          padding: '20px',
          borderBottom: '1px solid #e8e8e8',
          height: 'auto',
        }}
      >
        <Space size="large" wrap>
          <Button
            type="text"
            style={{ height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={handleNewConnection}
          >
            <Database size={48} color="#4CAF50" strokeWidth={1.5} />
            <span style={{ marginTop: 8, fontSize: 13 }}>连接</span>
          </Button>

          <Button
            type="text"
            style={{ height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={handleNewQuery}
          >
            <FileText size={48} color="#2196F3" strokeWidth={1.5} />
            <span style={{ marginTop: 8, fontSize: 13 }}>新建查询</span>
          </Button>

          <Button
            type="text"
            style={{ height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Table2 size={48} color="#2196F3" strokeWidth={1.5} />
            <span style={{ marginTop: 8, fontSize: 13 }}>表</span>
          </Button>

          <Button
            type="text"
            style={{ height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Eye size={48} color="#2196F3" strokeWidth={1.5} />
            <span style={{ marginTop: 8, fontSize: 13 }}>视图</span>
          </Button>

          <Button
            type="text"
            style={{ height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <FunctionSquare size={48} color="#FF9800" strokeWidth={1.5} />
            <span style={{ marginTop: 8, fontSize: 13 }}>函数</span>
          </Button>

          <Button
            type="text"
            style={{ height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Users size={48} color="#FF9800" strokeWidth={1.5} />
            <span style={{ marginTop: 8, fontSize: 13 }}>用户</span>
          </Button>

          <Button
            type="text"
            style={{ height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <History size={48} color="#FF5722" strokeWidth={1.5} />
            <span style={{ marginTop: 8, fontSize: 13 }}>查询</span>
          </Button>

          <Button
            type="text"
            style={{ height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Shield size={48} color="#757575" strokeWidth={1.5} />
            <span style={{ marginTop: 8, fontSize: 13 }}>备份</span>
          </Button>

          <Button
            type="text"
            style={{ height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Network size={48} color="#FF9800" strokeWidth={1.5} />
            <span style={{ marginTop: 8, fontSize: 13 }}>模型</span>
          </Button>

          <Button
            type="text"
            style={{ height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <BarChart3 size={48} color="#9C27B0" strokeWidth={1.5} />
            <span style={{ marginTop: 8, fontSize: 13 }}>BI</span>
          </Button>
        </Space>
      </Header>

      <Layout>
        {/* 左侧导航树 */}
        <Sider width="20%" style={{ background: '#fafafa' }}>
          <NavigatorTree onSelectTable={handleSelectTable} />
        </Sider>

        {/* 中央工作区 - 多 Tab */}
        <Content style={{ background: '#fff' }}>
          <Tabs
            type="editable-card"
            activeKey={activeKey}
            onChange={handleTabChange}
            onEdit={handleTabEdit}
            hideAdd
            style={{ height: '100%' }}
            items={tabs.map(tab => ({
              key: tab.key,
              label: tab.title,
              closable: tab.key !== 'welcome',
              children: (
                <div style={{ height: 'calc(100vh - 180px)' }}>
                  {renderTabContent(tab)}
                </div>
              ),
            }))}
          />
        </Content>

        {/* 右侧属性面板 */}
        <Sider width="20%" style={{ background: '#fafafa', overflow: 'auto' }}>
          <TableProperties tableName={selectedTable} />
        </Sider>
      </Layout>

      {/* 连接对话框 */}
      <ConnectionDialog
        visible={connectionDialogVisible}
        onClose={() => setConnectionDialogVisible(false)}
        onSave={handleSaveConnection}
      />
    </Layout>
  );
}

export default App;
