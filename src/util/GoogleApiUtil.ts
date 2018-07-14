// npm google API doesn't support webpack.
// Load gapi directly.
declare var gapi;

export default class GoogleApiUtil {
  static load(module: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      gapi.load(module, () => {
        resolve()
      })
    })
  }

  static setAuth(token) {
    gapi.client.setToken({ access_token: token })
  }

  static clientLoad(module: string, version: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      gapi.client.load(module, version, () => {
        resolve()
      })
    })
  }
}
