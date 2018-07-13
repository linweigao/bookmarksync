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

const fileFields = "files(kind, id, name, mimeType, parents, webViewLink)"

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
      q: "mimeType='application/vnd.google-apps.folder and trashed = false'"
    })
  }

  public getFilesUnderFolders(folderIDs: string[]): Promise<IDriveFile[]> {
    const q = folderIDs.map(id => `'${id}' in parents`).concat(' or')
    return this.list({
      fields: fileFields,
      q
    })
  }

  public async tree(): Promise<Map<string, IDriveFile[]>> {
    const map = new Map<string, IDriveFile[]>();
    const root = await this.get('root');
    map.set(root.id, null)
    const folders = await this.getFolders();
    folders.forEach(folder => {
      let parentKey = folder.parents[0];
      let children = map.get(parentKey) || [];
      children.push(folder)
      map.set(parentKey, children)
    })

    return map;
  }
}
