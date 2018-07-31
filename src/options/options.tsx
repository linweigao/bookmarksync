import * as React from 'react'
import * as ReactDom from 'react-dom'
import { Layout, Menu, Icon, Button } from 'antd';
const { Header, Sider, Content, Footer } = Layout;
import 'antd/es/card/style/css.js';
import 'antd/es/icon/style/css.js';
import 'antd/es/layout/style/css.js';
import 'antd/es/menu/style/css.js';
import 'antd/es/button/style/css.js';
import 'antd/es/modal/style/css.js';
import 'antd/es/col/style/css.js';
import 'antd/es/row/style/css.js';
import 'antd/es/form/style/css.js';
import 'antd/es/radio/style/css.js';
import 'antd/es/input/style/css.js';
import 'antd/es/tooltip/style/css.js';
import 'antd/es/dropdown/style/css.js';
import 'antd/es/message/style/css.js';

import GoogleDrivePanel from './GoogleDrive'

interface IOptionsState {
  googleAccount: React.ReactNode;
}

class Options extends React.Component<{}, IOptionsState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      googleAccount: null
    }
  }

  googleAccountChange = (account) => {
    this.setState({ googleAccount: account })
  }

  render() {
    return (
      <Layout style={{ height: '100vh' }}>
        <Sider trigger={null} collapsible={false} >
          <div className="logo" >
            <span>Bookmark Sync</span>
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Icon type="google" />
              <span>Google Drive</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <div style={{ float: 'right' }}>
              {this.state.googleAccount}
            </div>
          </Header>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
            <GoogleDrivePanel onAccountChange={this.googleAccountChange} />
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Bookmark Sync ©2018 Created by 120 Studio
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
