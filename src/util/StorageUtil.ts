import IGoogleDriveSyncOption from '../common/GoogleDriveSyncOption'

export default class StorageUtil {
  static setGoogleDriveSyncOptions(syncOptions: IGoogleDriveSyncOption[]): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.storage.sync.set({ 'GoogleDriveSyncOptions': JSON.stringify(syncOptions) }, () => {
        resolve()
      })
    })
  }

  static getGoogleDriveSyncOptions(): Promise<IGoogleDriveSyncOption[]> {
    return new Promise<IGoogleDriveSyncOption[]>(resolve => {
      chrome.storage.sync.get(['GoogleDriveSyncOptions'], (result) => {
        if (result.GoogleDriveSyncOptions) {
          try {
            const options = JSON.parse(result.GoogleDriveSyncOptions)
            resolve(options)
          }
          catch (err) {
            console.log(err)
            resolve(null)
          }
        }
        else {
          resolve(null)
        }
      })
    })
  }
}
