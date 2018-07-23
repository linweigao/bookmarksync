import * as React from 'react'
import { Modal, Button, Form, Input, Radio, Icon } from 'antd';

import IGoogleDriveSyncOption from '../common/GoogleDriveSyncOption'

interface IGoogleDriveOptionProps {
  visible: boolean;
  folders: { folderId: string, folderName: string }[];
  onSync: (folderId: string, folderName: string, bookmarkName: string) => Promise<any>;
  onCancel: () => void;
}

interface IGoogleDriveOptionState {
  folderId?: string;
  folderName?: string;
  bookmarkName?: string;
  isSyncing?: boolean;
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

export default class GoogleDriveModal extends React.PureComponent<IGoogleDriveOptionProps, IGoogleDriveOptionState> {
  /**
   *
   */
  constructor(props: IGoogleDriveOptionProps) {
    super(props);

    if (props.folders && props.folders.length > 0) {
      this.state = {
        folderId: props.folders[0].folderId,
        folderName: props.folders[0].folderName
      }
    }
    else {
      this.state = {}
    }
  }

  componentWillReceiveProps(nextProps: IGoogleDriveOptionProps, props: IGoogleDriveOptionProps) {
    if (nextProps.folders && nextProps.folders.length > 0) {
      this.setState({ folderId: nextProps.folders[0].folderId, folderName: nextProps.folders[0].folderName })
    }
  }

  onFolderChange = (e) => {
    const folderId = e.target.value
    const folderName = this.props.folders.find(folder => folder.folderId === folderId).folderName;
    this.setState({ folderId, folderName })
  }

  onBookmarkChange = (e) => {
    const bookmarkName = e.target.value;
    this.setState({ bookmarkName })
  }

  handleOk = async (e) => {
    this.setState({ isSyncing: true })
    try {
      await this.props.onSync(this.state.folderId, this.state.folderName, this.getBookName())
    }
    catch (ex) {
      console.log(ex)
    }
    this.setState({ isSyncing: false })
  }

  handleCancel = (e) => {
    this.props.onCancel()
  }

  getBookName() {
    return this.state.bookmarkName ? this.state.bookmarkName : this.state.folderName
  }

  render() {
    const bookmarkName = this.getBookName()
    const folders = this.props.folders && this.props.folders.map(folder => {
      return <Radio.Button value={folder.folderId}>{folder.folderName}</Radio.Button>
    })

    return (
      <Modal
        title="Sync Google Drive Folder to Bookmark"
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        maskClosable={false}
        confirmLoading={this.state.isSyncing}
        okText='Sync'
      >
        <Form>
          <Form.Item {...formItemLayout} label='Folder to sync'>
            <Radio.Group onChange={this.onFolderChange} value={this.state.folderId}>
              {folders}
            </Radio.Group>
          </Form.Item>
          <Form.Item {...formItemLayout} label='Bookmark location'>
            <Input value={bookmarkName} onChange={this.onBookmarkChange} />
          </Form.Item>
        </Form>
      </Modal>
    );
  }

}

