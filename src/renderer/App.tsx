// React 主组件 - Navicat 风格界面
import React from 'react';
import { Layout, Space, Button, Typography } from 'antd';
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
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function App() {
  const handleNewConnection = () => {
    console.log('新建连接');
    // 调用后端 API
    window.api?.getDatabaseDrivers().then(drivers => {
      console.log('数据库驱动：', drivers);
    });
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
        <Sider width="20%" style={{ background: '#fafafa', padding: 16 }}>
          <Title level={5}>我的连接</Title>
          <p style={{ color: '#999' }}>暂无连接，点击上方"连接"按钮创建</p>
        </Sider>

        {/* 中央工作区 */}
        <Content style={{ background: '#fff', padding: 24 }}>
          <div style={{ textAlign: 'center', paddingTop: 100 }}>
            <Database size={80} color="#ccc" strokeWidth={1} />
            <Title level={3} style={{ color: '#999', marginTop: 24 }}>
              欢迎使用 DBeaver Navicat Edition
            </Title>
            <p style={{ color: '#999' }}>开始创建数据库连接</p>
          </div>
        </Content>

        {/* 右侧属性面板 */}
        <Sider width="20%" style={{ background: '#fafafa', padding: 16 }}>
          <Title level={5}>属性</Title>
          <p style={{ color: '#999' }}>选择对象查看详情</p>
        </Sider>
      </Layout>
    </Layout>
  );
}

export default App;
