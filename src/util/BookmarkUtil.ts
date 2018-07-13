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
}
