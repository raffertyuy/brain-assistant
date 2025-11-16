export class StorageAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageAccessError';
  }
}

export class FileNotFoundError extends Error {
  constructor(public filePath: string) {
    super(`File not found: ${filePath}`);
    this.name = 'FileNotFoundError';
  }
}

export class StorageWriteError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StorageWriteError';
  }
}
