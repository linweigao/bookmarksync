import * as React from 'react'
import { Card } from 'antd'

import IGoogleDriveSyncOption from '../common/GoogleDriveSyncOption'

interface IGoogleDriveSyncSettingProps {
  options: IGoogleDriveSyncOption[]
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

class GoogleDriveSyncSetting extends React.PureComponent<IGoogleDriveSyncCardProps> {
  render() {
    return (
      <Card title='Google Drive Sync Setting'>
      </Card>
    )
  }
}
