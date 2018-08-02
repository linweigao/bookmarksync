import * as React from 'react'
import { Col, Button, Row, Icon, Dropdown, Menu, message } from 'antd'
import * as assign from 'object-assign'

import ChromeAuthUtil from '../../util/ChromeAuthUtil'
import GoogleApiUtil from '../../util/GoogleApiUtil'
import StorageUtil from '../../util/StorageUtil'
import GoogleDriveUtil from '../../util/GoogleDriveUtil'
import GoogleDriveSync from '../../util/GoogleDriveSync'

import { IGoogleDriveSyncOption, IGoogleDriveFolder } from './SyncOption'
import GoogleDriveModal from './Modal'
import GoogleDriveSyncCard from './Card'

interface IGoogleDriveSettingProps {
  onAccountChange: (account: React.ReactNode) => void
}

interface IGoogleDriveSettingState {
  token?: string;
  user?: { id: string, name: string }
  options?: IGoogleDriveSyncOption[];
  folders?: IGoogleDriveFolder[];

  // Status
  showModal: boolean;
  syncingOptions: IGoogleDriveSyncOption[];
}

export { IGoogleDriveSyncOption }

export default class GoogleDrivePanel extends React.PureComponent<IGoogleDriveSettingProps, IGoogleDriveSettingState> {
  constructor(props: IGoogleDriveSettingProps) {
    super(props);
    this.state = {
      showModal: false,
      syncingOptions: []
    }
  }

  async componentWillMount() {
    await GoogleApiUtil.load('client')
    await GoogleApiUtil.clientLoad('drive', 'v3')
    let googleDriveSyncOptions = await StorageUtil.getGoogleDriveSyncOptions()
    googleDriveSyncOptions = googleDriveSyncOptions.filter(opt => !!opt && !!opt.folder)
    console.log(googleDriveSyncOptions)
    this.setState({ options: googleDriveSyncOptions })

    let token, user
    try {
      const result = await this.loginGoogle(false)
      token = result.token
      user = result.user
      this.setState({ token, user }, () => {
        this.props.onAccountChange(this.createAccountNode(user.name))
      })

    }
    catch (ex) {
      console.log('auto login failed.', ex)
      if (token && ex.code === 401) {
        await ChromeAuthUtil.removeCachedAuthToken(token)
      }
      this.props.onAccountChange(this.createAccountNode(null))
    }
  }

  onAddSyncFolder = async () => {
    let folders = this.state.folders
    if (!folders) {
      const rootFolder = await GoogleDriveUtil.get('root')
      const teamDrives = await GoogleDriveUtil.teamDriveList();
      folders = [{ id: rootFolder.id, name: rootFolder.name, kind: rootFolder.kind }]
      if (teamDrives.teamDrives && teamDrives.teamDrives.length > 0) {
        teamDrives.teamDrives.forEach(teamDrive => {
          folders.push({ id: teamDrive.id, name: teamDrive.name, kind: teamDrive.kind })
        })
      }
    }

    this.setState({ showModal: true, folders })
  }

  onSyncFolder = async (folder: IGoogleDriveFolder, bookmarkName: string) => {
    const option: IGoogleDriveSyncOption = {
      userId: this.state.user.id,
      folder,
      bookmarkName
    }

    const options = this.state.options ? [...this.state.options, option] : [option];
    await this.syncFolder(option, options)
    this.setState({ options, showModal: false })
  }

  onReSyncFolder = async (option: IGoogleDriveSyncOption) => {
    const newSyncing = this.state.syncingOptions.slice()
    newSyncing.push(option)
    this.setState({ syncingOptions: newSyncing })
    const newOption = assign({}, option)
    const options = this.state.options.map(o => {
      if (o === option) {
        return newOption
      }

      return o;
    })

    await this.syncFolder(newOption, options)
    const clearSyncing = this.state.syncingOptions.filter(o => o != option)
    this.setState({ options, syncingOptions: clearSyncing })
  }

  private async syncFolder(option: IGoogleDriveSyncOption, options: IGoogleDriveSyncOption[]) {
    await GoogleDriveSync.syncDrive(option);
    await StorageUtil.setGoogleDriveSyncOptions(options)
    message.success(`Google Drive - [${option.folder.name}] has been mapped to bookmark - [${option.bookmarkName}]`)
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

  private async loginGoogle(interactive: boolean = true) {
    const token = await ChromeAuthUtil.getAuthToken(interactive)
    GoogleApiUtil.setAuth(token)
    const user = await GoogleApiUtil.getProfile()
    console.log(user.id, user.name)
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
      this.props.onAccountChange(this.createAccountNode(user.name))
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
    const cards = this.state.user
      && this.state.options
      && this.state.options.filter(option => !!option && option.userId === this.state.user.id)
        .map((option, index) => {
          const isSync = this.state.syncingOptions.indexOf(option) > -1 ? true : false
          return (
            <Col key={index} span={8}>
              <GoogleDriveSyncCard
                key={index}
                option={option}
                isSync={isSync}
                onRemoveOption={this.onRemoveSync}
                onResyncOption={this.onReSyncFolder} />
            </Col>
          )
        })

    return (
      <div style={{ background: '#ECECEC', padding: '30px' }}>
        <div>
          <span>Select your Google Drive folder </span>
          {!this.state.user && <Button icon='Google' onClick={this.onLogin}>Google Signin</Button>}
          {this.state.user && <Button icon='sync' onClick={this.onAddSyncFolder}>Sync New Drive</Button>}
        </div>
        <hr />
        <Row gutter={16} >
          {cards}
        </Row>
        <GoogleDriveModal
          visible={this.state.showModal}
          folders={this.state.folders}
          onSync={this.onSyncFolder}
          onCancel={this.onCancelSyncFolder} />
      </div>
    )
  }
}
