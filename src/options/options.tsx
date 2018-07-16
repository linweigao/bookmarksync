import * as React from 'react'
import * as ReactDom from 'react-dom'
import { Layout, Menu, Icon } from 'antd';
const { Header, Sider, Content, Footer } = Layout;
import 'antd/es/layout/style/index.css';
import 'antd/es/menu/style/index.css';

import ChromeAuthUtil from '../util/ChromeAuthUtil'
import GoogleApiUtil from '../util/GoogleApiUtil'
import DriveSync from '../DriveSync'

let token: string;

async function signin() {
  if (token) {
    await ChromeAuthUtil.removeCachedAuthToken(token)
  }

  token = await ChromeAuthUtil.getAuthToken(true)
  console.log(token);
  await GoogleApiUtil.load('client')
  GoogleApiUtil.setAuth(token)
  await GoogleApiUtil.clientLoad('drive', 'v3')
  const driveSync = new DriveSync()
  await driveSync.syncDrive()
}

class Options extends React.Component<any> {
  render() {
    return (
      <Layout style={{ height: '100vh' }}>
        <Sider trigger={null} collapsible={false} >
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Icon type="user" />
              <span>nav 1</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
          </Header>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
            test111222
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Bookmark Sync ©2018 Created by Keyboard120 Studio
          </Footer>
        </Layout>
      </Layout>
    )
  }
}

ReactDom.render(
  <Options></Options>,
  document.getElementById('root')
)
