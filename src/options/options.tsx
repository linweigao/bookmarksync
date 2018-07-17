import * as React from 'react'
import * as ReactDom from 'react-dom'
import { Layout, Menu, Icon, Button } from 'antd';
const { Header, Sider, Content, Footer } = Layout;
import 'antd/es/layout/style/index.css';
import 'antd/es/menu/style/index.css';
import 'antd/es/button/style/index.css';
import 'antd/es/modal/style/index.css';

import ChromeAuthUtil from '../util/ChromeAuthUtil'
import GoogleApiUtil from '../util/GoogleApiUtil'
import StorageUtil from '../util/StorageUtil'
import IGoogleDriveSyncOption from '../common/GoogleDriveSyncOption'
import DriveSync from '../DriveSync'

interface IOptionState {
  token?: string;
  userId?: string;
  currentSyncOptions?: IGoogleDriveSyncOption[];
}

class Options extends React.Component<void, IOptionState> {
  private googleDriveSyncOptions: IGoogleDriveSyncOption[];

  async componentWillMount() {
    await GoogleApiUtil.load('client')
    await GoogleApiUtil.clientLoad('drive', 'v3')
    this.googleDriveSyncOptions = await StorageUtil.getGoogleDriveSyncOptions();

    try {
      await this.loginGoogle(false);
    }
    catch (err) {
      // No login google account
    }
  }

  async syncGoogleDrive() {
    let token;
    try {
      await DriveSync.syncDrive()
    }
    catch (ex) {
      if (token && ex.code === 401) {
        await ChromeAuthUtil.removeCachedAuthToken(token)
        await this.loginGoogle(true)
      }
    }
  }

  async loginGoogle(interactive: boolean = true) {
    const token = await ChromeAuthUtil.getAuthToken(interactive)
    const userId = await ChromeAuthUtil.getProfileUserInfo();
    GoogleApiUtil.setAuth(token)
    this.setState({ token, userId })
  }

  async switchAccount() {
    await ChromeAuthUtil.revokeToken(token)
    await ChromeAuthUtil.removeCachedAuthToken(token)
    await this.loginGoogle(true)
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
            <Button style={{ float: 'right' }} type="primary" icon="poweroff" onClick={this.loginGoogle}>
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
