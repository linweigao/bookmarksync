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

  static getProfileUserInfo(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      chrome.identity.getProfileUserInfo(userInfo => {
        console.log(userInfo)
        if (userInfo && userInfo.id) {
          resolve(userInfo.id)
        }
        else {
          reject("cannot get user info")
        }
      })
    })
  }

  static revokeToken(token: string): Promise<any> {
    const revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + token;
    return window.fetch(revokeUrl)
  }

  static removeCachedAuthToken(token: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      chrome.identity.removeCachedAuthToken({ token }, () => {
        resolve()
      })
    })
  }

  static authWebFlow(clientId: string, scope: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const callbackUrl = chrome.identity.getRedirectURL('options.html')
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&scope=${scope}&redirect_uri=${callbackUrl}&prompt=select_account`
      chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
      }, (redirectURL) => {
        const q = redirectURL.substr(redirectURL.indexOf('#') + 1);
        const parts = q.split('&');
        let token
        for (var i = 0; i < parts.length; i++) {
          var kv = parts[i].split('=');
          if (kv[0] == 'access_token') {
            token = kv[1];
            break;
          }
        }

        if (token) {
          resolve(token)
        }
        else {
          reject('token is not available in ' + redirectURL)
        }
      })
    })
  }
}
