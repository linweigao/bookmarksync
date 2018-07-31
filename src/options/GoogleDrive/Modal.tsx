import * as React from 'react'
import { Modal, Button, Form, Input, Radio, Icon } from 'antd';

import { IGoogleDriveFolder } from './SyncOption'

interface IGoogleDriveOptionProps {
  visible: boolean;
  folders: IGoogleDriveFolder[];
  onSync: (folder: IGoogleDriveFolder, bookmarkName: string) => Promise<any>;
  onCancel: () => void;
}

interface IGoogleDriveOptionState {
  folder?: IGoogleDriveFolder;
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
        folder: props.folders[0]
      }
    }
    else {
      this.state = {}
    }
  }

  componentWillReceiveProps(nextProps: IGoogleDriveOptionProps, props: IGoogleDriveOptionProps) {
    if (nextProps.folders && nextProps.folders.length > 0) {
      this.setState({ folder: nextProps.folders[0] })
    }
  }

  onFolderChange = (e) => {
    const folderId = e.target.value
    const folder = this.props.folders.find(folder => folder.id === folderId);
    this.setState({ folder })
  }

  onBookmarkChange = (e) => {
    const bookmarkName = e.target.value;
    this.setState({ bookmarkName })
  }

  handleOk = async (e) => {
    this.setState({ isSyncing: true })
    try {
      await this.props.onSync(this.state.folder, this.getBookName())
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
    if (this.state.bookmarkName) {
      return this.state.bookmarkName
    }

    return this.state.folder && this.state.folder.name
  }

  render() {
    if (!this.props.visible) {
      return <div />
    }

    const bookmarkName = this.getBookName()
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    }

    const folders = this.props.folders && this.props.folders.map(folder => {
      return <Radio.Button style={radioStyle} value={folder.id} key={folder.id}>{folder.name}</Radio.Button>
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
            <Radio.Group onChange={this.onFolderChange} value={this.state.folder.id}>
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
