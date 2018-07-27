import BookmarkUtil from './BookmarkUtil'
import GoogleDriveUtil, { IDriveFile } from './GoogleDriveUtil'

import { IGoogleDriveSyncOption } from '../options/GoogleDrive'

interface IDriveTree {
  root: IDriveFile,
  map: Map<string, IDriveFile[]>
}

const fileFields = 'nextPageToken, files(kind, id, name, mimeType, parents, webViewLink)'
const folderMimeType = 'application/vnd.google-apps.folder'
const TeamDriveKind = 'drive#teamDrive'

export default class GoogleDriveSync {
  // TODO: sharedWithMe = false doesn't work.
  public static getFolders(options): Promise<IDriveFile[]> {
    options.fields = fileFields
    options.q = "mimeType='application/vnd.google-apps.folder' and trashed = false"
    return GoogleDriveUtil.list(options)
  }

  public static getFilesUnderFolders(folderIDs: string[], options): Promise<IDriveFile[]> {
    const folderQuery = '(' + folderIDs.map(id => `'${id}' in parents`).join(' or ') + ')'
    const typeQuery = "mimeType!='application/vnd.google-apps.folder'"
    options.fields = fileFields
    options.q = typeQuery + ' and trashed = false and ' + folderQuery
    return GoogleDriveUtil.list(options)
  }

  public static async tree(option: IGoogleDriveSyncOption): Promise<IDriveTree> {
    const map = new Map<string, IDriveFile[]>();
    const root = option.folder
    const queryOptions: any = { corpora: 'user' }
    if (option.folder.kind === TeamDriveKind) {
      queryOptions.corpora = 'teamDrive'
      queryOptions.includeTeamDriveItems = true
      queryOptions.supportsTeamDrives = true
      queryOptions.teamDriveId = option.folder.id
    }

    map.set(root.id, null)
    const folders = await this.getFolders(queryOptions);
    folders.forEach(folder => {
      if (!folder.parents || folder.parents.length == 0) {
        // 'Shared with me' file
        return;
      }

      const parentKey = folder.parents[0];
      const children = map.get(parentKey) || [];
      children.push(folder)
      map.set(parentKey, children)
    })

    const folderIds = folders.concat(root).map(folder => folder.id)
    const files = await this.getFilesUnderFolders(folderIds, queryOptions)
    files.forEach(file => {
      if (!file.parents || file.parents.length == 0) {
        // 'Shared with me' file 
        return;
      }
      const parentKey = file.parents[0];
      const children = map.get(parentKey) || [];
      children.push(file)
      map.set(parentKey, children)
    })

    return { root, map };
  }

  public static async syncBookmark(file: IDriveFile, map: Map<string, IDriveFile[]>, parent: string): Promise<void> {
    if (file.mimeType === folderMimeType) {
      const node = await BookmarkUtil.createFolder(file.name, parent)
      const children = map.get(file.id);
      if (children && children.length > 0) {
        await Promise.all(children.map(async child => {
          await this.syncBookmark(child, map, node.id)
        }));
      }
    }
    else {
      const node = await BookmarkUtil.createFile(file.name, file.webViewLink, parent)
    }
  }

  public static async syncDrive(option: IGoogleDriveSyncOption): Promise<void> {
    let targetFolder;
    if (option.bookmarkId) {
      // find target bookmark by Id
      targetFolder = await BookmarkUtil.get(option.bookmarkId)
    }

    if (!targetFolder) {
      const bookmarkTree = await BookmarkUtil.getTree()
      const bookmarkBar = bookmarkTree[0].children[0]
      targetFolder = await BookmarkUtil.createFolder(option.bookmarkName, bookmarkBar.id)
      option.bookmarkId = targetFolder.id
    }

    const { root, map } = await this.tree(option)
    await BookmarkUtil.removeChildren(targetFolder)

    const children = map.get(root.id);
    if (children && children.length > 0) {
      await Promise.all(children.map(async child => {
        await this.syncBookmark(child, map, targetFolder.id)
      }));
    }

    option.lastSyncTime = new Date()
  }
}
