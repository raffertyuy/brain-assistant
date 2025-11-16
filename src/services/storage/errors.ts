export class StorageAccessError extends Error {
  public readonly userMessage: string;
  
  constructor(message: string) {
    super(message);
    this.name = 'StorageAccessError';
    this.userMessage = 'Unable to access local storage. Please grant file system permissions or try using a supported browser (Chrome, Edge).';
  }
}

export class FileNotFoundError extends Error {
  public readonly userMessage: string;
  
  constructor(public filePath: string) {
    super(`File not found: ${filePath}`);
    this.name = 'FileNotFoundError';
    this.userMessage = 'The requested file could not be found. Your data may have been moved or deleted.';
  }
}

export class StorageWriteError extends Error {
  public readonly userMessage: string;
  
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StorageWriteError';
    this.userMessage = 'Failed to save your changes. Please check that you have write permissions and try again.';
  }
}
