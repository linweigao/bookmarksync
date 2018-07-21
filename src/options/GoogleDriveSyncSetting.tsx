import * as React from 'react'
import { Card, Button } from 'antd'

import ChromeAuthUtil from '../util/ChromeAuthUtil'
import GoogleApiUtil from '../util/GoogleApiUtil'
import StorageUtil from '../util/StorageUtil'
import DriveSync from '../DriveSync'

import IGoogleDriveSyncOption from '../common/GoogleDriveSyncOption'
import GoogleDriveModal from './GoogleDriveModal'

interface IGoogleDriveSyncSettingState {
  token?: string;
  userId?: string;
  options?: IGoogleDriveSyncOption[];
  currentOption?: IGoogleDriveSyncOption;
}

interface IGoogleDriveSyncCardProps {
  option: IGoogleDriveSyncOption
}

const gridStyle = {
  width: '33%',
};

class GoogleDriveSyncCard extends React.PureComponent<IGoogleDriveSyncCardProps> {
  render() {
    return (
      <Card.Grid style={gridStyle}>
        <Card type='inner' title={this.props.option.bookmarkName}></Card>
      </Card.Grid>
    )
  }
}

class GoogleDriveSyncSetting extends React.PureComponent<{}, IGoogleDriveSyncSettingState> {
  constructor(props: {}) {
    super(props);
    this.state = {
    }

    this.addSyncFolder = this.addSyncFolder.bind(this)
    this.onSyncFolder = this.onSyncFolder.bind(this)
  }

  async componentWillMount() {
    await GoogleApiUtil.load('client')
    await GoogleApiUtil.clientLoad('drive', 'v3')
    const googleDriveSyncOptions = await StorageUtil.getGoogleDriveSyncOptions();
    this.setState({ options: googleDriveSyncOptions })

    let token, userId
    try {
      const result = await this.loginGoogle(false)
      token = result.token
      userId = result.userId
      const rootFolder = await DriveSync.get('root')
      this.setState({ token, userId })
    }
    catch (ex) {
      if (token && ex.code === 401) {
        await ChromeAuthUtil.removeCachedAuthToken(token)
      }
    }
  }

  async addSyncFolder() {
    let userId = this.state.userId;
    let token = this.state.token;
    if (!token) {
      const result = await this.loginGoogle(true)
      userId = result.userId
      token = result.token
    }

    const rootFolder = await DriveSync.get('root')
    const option: IGoogleDriveSyncOption = {
      userId,
      folderId: rootFolder.id,
      folderName: rootFolder.name
    }
    this.setState({ token, userId, currentOption: option })
  }

  async onSyncFolder(option: IGoogleDriveSyncOption) {
    await DriveSync.syncDrive();

    const options = this.state.options ? [...this.state.options, option] : [option];
    this.setState({ options, currentOption: null })
  }

  onCancelSyncFolder() {
    this.setState({ currentOption: null })
  }

  async loginGoogle(interactive: boolean = true) {
    const token = await ChromeAuthUtil.getAuthToken(interactive)
    const userId = await ChromeAuthUtil.getProfileUserInfo();
    GoogleApiUtil.setAuth(token)
    console.log(token, userId);
    return { token, userId }
  }

  async switchAccount() {
    await ChromeAuthUtil.revokeToken(this.state.token)
    await ChromeAuthUtil.removeCachedAuthToken(this.state.token)
    await this.loginGoogle(true)
  }

  render() {
    const cards = this.state.token && this.state.options && this.state.options.map(option => {
      <GoogleDriveSyncCard option={option} />
    })

    return (
      <div>
        <Card title='Google Drive Sync Setting'>
          {cards}
          <Card.Grid style={gridStyle}>
            <Button type='primary' onClick={this.addSyncFolder}>Select your drive to sync</Button>
          </Card.Grid>
        </Card>
        <GoogleDriveModal
          visible={!!this.state.currentOption}
          option={this.state.currentOption}
          onSync={this.onSyncFolder}
          onCancel={this.onCancelSyncFolder} />
      </div>
    )
  }
}

export default GoogleDriveSyncSetting;
