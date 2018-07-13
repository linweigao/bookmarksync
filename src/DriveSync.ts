import BookmarkUtil from './util/BookmarkUtil'

interface IDriveChange {

}

interface IDriveChanges {
  changes: Array<IDriveChange>,
  kind: string,
  newStartPageToken: string
}

interface IDriveFile {
  kind: string,
  id: string,
  name: string,
  mimeType: string,
  parents: string[],
  webViewLink: string
}

interface IDriveTree {
  root: IDriveFile,
  map: Map<string, IDriveFile[]>
}

const fileFields = 'files(kind, id, name, mimeType, parents, webViewLink)'
const folderMimeType = 'application/vnd.google-apps.folder'

export default class DriveSync {
  private drive;

  constructor(drive) {
    this.drive = drive;
  }

  public getStartPageToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.drive.changes.getStartPageToken({})
        .execute((res) => {
          if (res.error) {
            reject(res.error)
          } else {
            resolve(res.startPageToken)
          }
        })
    })
  }

  public listChanges(startToken): Promise<IDriveChange> {
    return new Promise<IDriveChange>((resolve, reject) => {
      this.drive.changes.list({ pageToken: startToken })
        .execute(res => {
          if (res.error) {
            reject(res.error)
          }
          else {
            resolve(res)
          }
        })
    })
  }

  public list(options): Promise<IDriveFile[]> {
    return new Promise<IDriveFile[]>((resolve, reject) => {
      this.drive.files.list(options)
        .execute(res => {
          if (res.error) {
            reject(res.error)
          }
          else {
            resolve(res.files)
          }
        })
    })
  }

  public get(fileId: string): Promise<IDriveFile> {
    return new Promise<IDriveFile>((resolve, reject) => {
      this.drive.files.get({ fileId })
        .execute(res => {
          if (res.error) {
            reject(res.error)
          }
          else {
            resolve(res)
          }
        })
    })
  }

  public getFolders(): Promise<IDriveFile[]> {
    return this.list({
      fields: fileFields,
      q: "mimeType='application/vnd.google-apps.folder' and trashed = false"
    })
  }

  public getFilesUnderFolders(folderIDs: string[]): Promise<IDriveFile[]> {
    const folderQuery = '(' + folderIDs.map(id => `'${id}' in parents`).join(' or ') + ')'
    const typeQuery = "mimeType!='application/vnd.google-apps.folder'"
    console.log(folderQuery)
    return this.list({
      fields: fileFields,
      q: typeQuery + ' and trashed = false and ' + folderQuery
    })
  }

  public async tree(): Promise<IDriveTree> {
    const map = new Map<string, IDriveFile[]>();
    const root = await this.get('root');
    map.set(root.id, null)
    const folders = await this.getFolders();
    folders.forEach(folder => {
      const parentKey = folder.parents[0];
      const children = map.get(parentKey) || [];
      children.push(folder)
      map.set(parentKey, children)
    })

    const folderIds = folders.concat(root).map(folder => folder.id)
    const files = await this.getFilesUnderFolders(folderIds)
    files.forEach(file => {
      const parentKey = file.parents[0];
      const children = map.get(parentKey) || [];
      children.push(file)
      map.set(parentKey, children)
    })

    return { root, map };
  }

  public async syncBookmark(file: IDriveFile, map: Map<string, IDriveFile[]>, parent: string) {
    if (file.mimeType === folderMimeType) {
      const node = await BookmarkUtil.createFolder(file.name, parent)
      const children = map.get(file.id);
      if (children && children.length > 0) {
        children.forEach(child => {
          this.syncBookmark(child, map, node.id)
        });
      }
    }
    else {
      const node = await BookmarkUtil.createFile(file.name, file.webViewLink, parent)
    }
  }
}
