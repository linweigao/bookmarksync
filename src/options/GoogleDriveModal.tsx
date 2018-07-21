import * as React from 'react'
import { Modal, Button } from 'antd';

import IGoogleDriveSyncOption from '../common/GoogleDriveSyncOption'

interface IGoogleDriveOptionProps {
  visible: boolean;
  option: IGoogleDriveSyncOption;
  onSync: (options: IGoogleDriveSyncOption) => void;
  onCancel: () => void;
}

interface IGoogleDriveOptionState {
  driveId: string;
  bookmarkName: string;
}

export default class GoogleDriveModal extends React.Component<IGoogleDriveOptionProps, IGoogleDriveOptionState> {
  handleOk = (e) => {
    this.props.onSync(this.props.option)
  }

  handleCancel = (e) => {
    this.props.onCancel()
  }

  render() {
    return (
      <Modal
        title="Sync Google Drive to Bookmark"
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    );
  }

}

