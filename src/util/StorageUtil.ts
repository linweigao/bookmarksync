export default class StorageUtil {
  static setStartToken(pageStartToken): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.storage.sync.set({ 'startToken': pageStartToken }, () => {
        resolve()
      })
    })
  }

  static getStartToken(): Promise<string> {
    return new Promise<string>(resolve => {
      chrome.storage.sync.get(['startToken'], (result) => {
        resolve(result.key)
      })
    })
  }
}
