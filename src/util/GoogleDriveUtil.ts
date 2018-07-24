declare var gapi;

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

export { IDriveFile }

export default class GoogleDriveUtil {
  public static getStartPageToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      gapi.client.drive.changes.getStartPageToken({})
        .execute((res) => {
          if (res.error) {
            reject(res.error)
          } else {
            resolve(res.startPageToken)
          }
        })
    })
  }

  public static listChanges(startToken): Promise<IDriveChange> {
    return new Promise<IDriveChange>((resolve, reject) => {
      gapi.client.drive.changes.list({ pageToken: startToken })
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

  public static list(options): Promise<IDriveFile[]> {
    return new Promise<IDriveFile[]>((resolve, reject) => {
      gapi.client.drive.files.list(options)
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

  public static get(fileId: string): Promise<IDriveFile> {
    return new Promise<IDriveFile>((resolve, reject) => {
      gapi.client.drive.files.get({ fileId })
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
}
