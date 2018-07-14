import * as React from 'react'
import * as ReactDom from 'react-dom'

import ChromeAuthUtil from '../util/ChromeAuthUtil'
import GoogleApiUtil from '../util/GoogleApiUtil'
import DriveSync from '../DriveSync'

let token: string;

async function signin() {
  if (token) {
    await ChromeAuthUtil.removeCachedAuthToken(token)
  }

  token = await ChromeAuthUtil.getAuthToken(true)
  console.log(token);
  await GoogleApiUtil.load('client')
  GoogleApiUtil.setAuth(token)
  await GoogleApiUtil.clientLoad('drive', 'v3')
  const driveSync = new DriveSync()
  await driveSync.syncDrive()
}

class Options extends React.Component<any> {
  render() {
    return (
      <div>hello</div>
    )
  }
}

ReactDom.render(
  <Options></Options>,
  document.getElementById('root')
)
