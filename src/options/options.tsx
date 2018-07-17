import * as React from 'react'
import * as ReactDom from 'react-dom'
import { Layout, Menu, Icon, Button } from 'antd';
const { Header, Sider, Content, Footer } = Layout;
import 'antd/es/layout/style/index.css';
import 'antd/es/menu/style/index.css';
import 'antd/es/button/style/index.css';

import ChromeAuthUtil from '../util/ChromeAuthUtil'
import GoogleApiUtil from '../util/GoogleApiUtil'
import DriveSync from '../DriveSync'

class Options extends React.Component<any> {
  async syncGoogleDrive() {
    let token;
    try {
      token = await ChromeAuthUtil.getAuthToken(true)
      console.log(token);
      await GoogleApiUtil.load('client')
      GoogleApiUtil.setAuth(token)
      await GoogleApiUtil.clientLoad('drive', 'v3')
      const driveSync = new DriveSync()
      await driveSync.syncDrive()

      // Remove token from cache to support multi accounts
      await ChromeAuthUtil.revokeToken(token)
      await ChromeAuthUtil.removeCachedAuthToken(token)
    }
    catch (ex) {
      if (token && ex.code === 401) {
        await ChromeAuthUtil.removeCachedAuthToken(token)
      }
    }
  }

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
            <Button style={{ float: 'right' }} type="primary" icon="plus-circle-o" onClick={this.syncGoogleDrive}>
              Sync Google Drive
            </Button>
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
