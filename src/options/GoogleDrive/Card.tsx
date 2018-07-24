import * as React from 'react'
import { Card, Button, Tooltip } from 'antd'
import * as moment from 'moment';

import IGoogleDriveSyncOption from './SyncOption'

interface ISyncCardProps {
  option: IGoogleDriveSyncOption
  onRemoveOption: (option: IGoogleDriveSyncOption) => void
  onResyncOption: (option: IGoogleDriveSyncOption) => void
}

export default class GoogleDriveSyncCard extends React.PureComponent<ISyncCardProps> {
  onDelClick = e => {
    this.props.onRemoveOption(this.props.option)
  }

  onSyncClick = e => {
    this.props.onResyncOption(this.props.option)
  }

  render() {
    const del = <Tooltip key='remove' placement="top" title='Remove Sync Folder'>
      <Button type='danger' shape='circle' icon='delete' style={{ marginRight: '5px' }} onClick={this.onDelClick} />
    </Tooltip>
    const sync = <Tooltip key='sync' placement="top" title='Sync Now'>
      <Button type='primary' icon='sync' shape='circle' onClick={this.onSyncClick} />
    </Tooltip>
    const extra = [del, sync]
    const lastSyncTime = 'Last sync time: ' + moment(this.props.option.lastSyncTime).fromNow()
    const syncTo = 'Sync to ' + this.props.option.bookmarkName
    return (
      <Card title={this.props.option.folderName} extra={extra}>
        <Card.Meta
          title={syncTo}
          description={lastSyncTime}
        />
      </Card>
    )
  }
}
