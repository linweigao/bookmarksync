export interface IGoogleDriveSyncOption {
  userId: string;
  folder: IGoogleDriveFolder;
  bookmarkName?: string;
  bookmarkId?: string;
  lastSyncTime?: Date;
}

export interface IGoogleDriveFolder {
  id: string;
  name: string;
  kind: string;
}
