// npm google API doesn't support webpack.
// Load gapi directly.
declare var gapi;

interface IGoogleAuthOptions {
  client_id: string;
  scope: string;
  prompt: 'consent' | 'select_account'
}

export default class GoogleApiUtil {
  static load(module: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      gapi.load(module, () => {
        resolve()
      })
    })
  }

  static async auth(options: IGoogleAuthOptions) {
    await gapi.load('auth2');
    const gAuth = await gapi.auth2.init({ client_id: options.client_id })
    await gAuth.signIn({
      scope: options.scope,
      prompt: options.prompt
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
