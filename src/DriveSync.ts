interface IDriveChange {

}

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
}
