export default class ChromeAuthUtil {
  static getAuthToken(interactive: boolean, accountId?: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const account = accountId ? { id: accountId } : undefined;
      chrome.identity.getAuthToken({ interactive, account }, token => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        }
        else {
          resolve(token)
        }
      })
    })
  }

  static removeCachedAuthToken(token: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      chrome.identity.removeCachedAuthToken({ token }, () => {
        resolve()
      })
    })
  }
}
