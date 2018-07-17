import * as React from 'react'
import { Modal, Button } from 'antd';

interface IGoogleDriveOption {
  visible: boolean;
  onSave: () => void;
  onCancel: () => void;
}

interface IGoogleDriveOptionState {
  driveId: string;
  bookmarkName: string;
}

export class GoogleDriveOption extends React.Component<IGoogleDriveOption, IGoogleDriveOptionState> {
  handleOk = (e) => {
    console.log(e);
  }

  handleCancel = (e) => {
    console.log(e);
  }

  render() {
    return (
      <Modal
        title="Google Drive Sync Options"
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

