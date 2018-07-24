export default interface IGoogleDriveSyncOption {
  userId: string;
  folderId: string;
  folderName: string;
  bookmarkName?: string;
  lastSyncTime?: Date;
}
