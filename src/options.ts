import * as $ from 'jquery';

import ChromeAuthUtil from './util/ChromeAuthUtil'
import GoogleApiUtil from './util/GoogleApiUtil'
import DriveSync from './DriveSync'

let token: string;

function onload() {

}

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

$('#signin').click(signin);

