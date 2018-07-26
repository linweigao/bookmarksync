import * as React from 'react'
import { Col, Card, Button, Row, Icon, Tooltip, Dropdown, Menu } from 'antd'
import * as assign from 'object-assign'

import ChromeAuthUtil from '../../util/ChromeAuthUtil'
import GoogleApiUtil from '../../util/GoogleApiUtil'
import StorageUtil from '../../util/StorageUtil'
import GoogleDriveUtil from '../../util/GoogleDriveUtil'
import GoogleDriveSync from '../../util/GoogleDriveSync'

import IGoogleDriveSyncOption from './SyncOption'
import GoogleDriveModal from './Modal'
import GoogleDriveSyncCard from './Card'

interface IGoogleDriveSettingProps {
  onAccountChange: (account: React.ReactNode) => void
}

interface IGoogleDriveSettingState {
  token?: string;
  user?: { id: string, email: string }
  options?: IGoogleDriveSyncOption[];
  folders?: { folderId: string, folderName: string }[];
  showModal: boolean;
}

export { IGoogleDriveSyncOption }

export default class GoogleDrivePanel extends React.PureComponent<IGoogleDriveSettingProps, IGoogleDriveSettingState> {
  constructor(props: IGoogleDriveSettingProps) {
    super(props);
    this.state = {
      showModal: false
    }
  }

  async componentWillMount() {
    await GoogleApiUtil.load('client')
    await GoogleApiUtil.clientLoad('drive', 'v3')
    let googleDriveSyncOptions = await StorageUtil.getGoogleDriveSyncOptions();
    googleDriveSyncOptions = googleDriveSyncOptions.filter(opt => !!opt)
    this.setState({ options: googleDriveSyncOptions })

    let token, user
    try {
      const result = await this.loginGoogle(false)
      token = result.token
      user = result.user
      const rootFolder = await GoogleDriveUtil.get('root')
      this.setState({ token, user }, () => {
        this.props.onAccountChange(this.createAccountNode(user.email))
      })

    }
    catch (ex) {
      if (token && ex.code === 401) {
        await ChromeAuthUtil.removeCachedAuthToken(token)
      }
      this.props.onAccountChange(this.createAccountNode(null))
    }
  }

  addSyncFolder = async () => {
    let user = this.state.user;
    let token = this.state.token;
    if (!token) {
      const result = await this.loginGoogle(true)
      user = result.user
      token = result.token
    }

    const rootFolder = await GoogleDriveUtil.get('root')
    this.setState({ token, user, showModal: true, folders: [{ folderId: rootFolder.id, folderName: rootFolder.name }] }, () => {
      this.props.onAccountChange(this.createAccountNode(user.email))
    })
  }

  onAddSyncFolder = async (folderId: string, folderName: string, bookmarkName: string) => {
    const option: IGoogleDriveSyncOption = {
      userId: this.state.user.id,
      folderId,
      folderName,
      bookmarkName
    }
    await GoogleDriveSync.syncDrive(option);

    const options = this.state.options ? [...this.state.options, option] : [option];
    await StorageUtil.setGoogleDriveSyncOptions(options)
    this.setState({ options, showModal: false })
  }

  onReSyncFolder = async (option: IGoogleDriveSyncOption) => {
    const newOption = assign({}, option)
    await GoogleDriveSync.syncDrive(newOption);
    const options = this.state.options.map(o => {
      if (o === option) {
        return newOption
      }
    })

    await StorageUtil.setGoogleDriveSyncOptions(options)
    this.setState({ options })
  }

  onCancelSyncFolder = () => {
    this.setState({ showModal: false })
  }

  onRemoveSync = async (option: IGoogleDriveSyncOption) => {
    const options = this.state.options.slice()
    const index = options.indexOf(option)
    options.splice(index, 1)
    await StorageUtil.setGoogleDriveSyncOptions(options)
    this.setState({ options })
  }

  async loginGoogle(interactive: boolean = true) {
    const token = await ChromeAuthUtil.getAuthToken(interactive)
    const user = await ChromeAuthUtil.getProfileUserInfo();
    GoogleApiUtil.setAuth(token)
    console.log(token, user);
    return { token, user }

  }

  onAccountMenuClick = async (param) => {
    if (param.key === 'logout') {
      await this.onLogout()
    }
    else if (param.key === 'switch') {
      await this.switchAccount()
    }
    else {
      console.error('unknown key', param)
    }
  }

  onLogin = async () => {
    const { user, token } = await this.loginGoogle(true)
    this.setState({ token, user }, () => {
      this.props.onAccountChange(this.createAccountNode(user.email))
    })
  }

  onLogout = async () => {
    await ChromeAuthUtil.revokeToken(this.state.token)
    await ChromeAuthUtil.removeCachedAuthToken(this.state.token)
    this.setState({ token: null, user: null, options: null }, () => {
      this.props.onAccountChange(this.createAccountNode(null))
    })
  }

  async switchAccount() {
    await ChromeAuthUtil.revokeToken(this.state.token)
    await ChromeAuthUtil.removeCachedAuthToken(this.state.token)
    await this.onLogin()
  }

  private createAccountNode(name: string) {
    if (!name) {
      return <span style={{ paddingRight: '20px' }} onClick={this.onLogin} >
        <Icon type='google' />
        <span>Login</span>
      </span>
    }

    const menu = (
      <Menu onClick={this.onAccountMenuClick}>
        <Menu.Item key='switch'>
          <Icon type='swap' />Switch Account
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key='logout' >
          <Icon type='logout' />logout
        </Menu.Item>
      </Menu>
    );

    return (<Dropdown overlay={menu} >
      <span style={{ paddingRight: '20px' }} >
        <Icon type='google' />
        <span>{name}</span>
      </span>
    </Dropdown >)
  }

  render() {
    const cards = this.state.token && this.state.options && this.state.options.map((option, index) => {
      return (
        <Col key={index} span={8}>
          <GoogleDriveSyncCard
            key={index}
            option={option}
            onRemoveOption={this.onRemoveSync}
            onResyncOption={this.onReSyncFolder} />
        </Col>
      )
    })

    return (
      <div style={{ background: '#ECECEC', padding: '30px' }}>
        <Row gutter={16} >
          {cards}
          <Col span={8}>
            <Button type='primary' onClick={this.addSyncFolder}>Select your drive to sync</Button>
          </Col>
        </Row>
        <GoogleDriveModal
          visible={this.state.showModal}
          folders={this.state.folders}
          onSync={this.onAddSyncFolder}
          onCancel={this.onCancelSyncFolder} />
      </div>
    )
  }
}
