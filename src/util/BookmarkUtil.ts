export default class BookmarkUtil {
  static getTree(): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
    return new Promise<chrome.bookmarks.BookmarkTreeNode[]>(resolve => {
      chrome.bookmarks.getTree(result => {
        resolve(result)
      })
    })
  }

  static createFile(title: string, url: string, parentId?: string, index?: number): Promise<chrome.bookmarks.BookmarkTreeNode> {
    return new Promise<chrome.bookmarks.BookmarkTreeNode>(resolve => {
      chrome.bookmarks.create({ title, url, parentId, index }, result => {
        resolve(result)
      })
    })
  }

  static createFolder(title: string, parentId?: string, index?: number): Promise<chrome.bookmarks.BookmarkTreeNode> {
    return new Promise<chrome.bookmarks.BookmarkTreeNode>(resolve => {
      chrome.bookmarks.create({ title, parentId, index }, result => {
        resolve(result)
      })
    })
  }

  static get(id: string): Promise<chrome.bookmarks.BookmarkTreeNode> {
    return new Promise<chrome.bookmarks.BookmarkTreeNode>(resolve => {
      chrome.bookmarks.get(id, result => {
        if (result && result.length > 0) {
          resolve(result[0])
        }
        else {
          resolve(null)
        }
      })
    })
  }

  static getChildren(id: string): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
    return new Promise<chrome.bookmarks.BookmarkTreeNode[]>(resolve => {
      chrome.bookmarks.getChildren(id, result => {
        resolve(result)
      })
    })
  }

  static remove(id: string): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.bookmarks.remove(id, () => {
        resolve()
      })
    })
  }

  static removeTree(id: string): Promise<void> {
    return new Promise<void>(resolve => {
      chrome.bookmarks.removeTree(id, () => {
        resolve()
      })
    })
  }

  static async removeChildren(node: chrome.bookmarks.BookmarkTreeNode): Promise<void> {
    const children = await this.getChildren(node.id)
    if (!children || children.length === 0) {
      return Promise.resolve();
    }

    await Promise.all(children.map(async child => {
      await this.removeTree(child.id);
    }))
  }
}
