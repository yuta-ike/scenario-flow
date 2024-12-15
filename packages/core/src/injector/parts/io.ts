export type DirHandle<
  FileHandleAdditional extends Record<string, unknown> = Record<
    string,
    unknown
  >,
  DirHandleAdditional extends Record<string, unknown> = FileHandleAdditional,
> = {
  name: string
  path: string
  files: FileHandle<FileHandleAdditional>[]
  children: DirHandle<FileHandleAdditional, DirHandleAdditional>[]
} & DirHandleAdditional

export type FileHandle<
  FileHandleAdditional extends Record<string, unknown> = Record<
    string,
    unknown
  >,
> = {
  name: string
  path: string
} & FileHandleAdditional

export type InjectedIo<
  FileEntryAdditional extends Record<string, unknown> = Record<string, unknown>,
  DirEntryAdditional extends Record<string, unknown> = FileEntryAdditional,
> = {
  // ファイルシステム操作
  createFile: (
    entry: DirHandle<FileEntryAdditional, DirEntryAdditional>,
    name: string,
  ) => Promise<FileHandle<FileEntryAdditional>>
  createDir: (
    entry: DirHandle<FileEntryAdditional, DirEntryAdditional>,
    name: string,
  ) => Promise<DirHandle<FileEntryAdditional, DirEntryAdditional>>
  getOrCreateFile: (
    entry: DirHandle<FileEntryAdditional, DirEntryAdditional>,
    name: string,
  ) => Promise<FileHandle<FileEntryAdditional>>
  deleteFile: (
    entry: DirHandle<FileEntryAdditional, DirEntryAdditional>,
    name: string,
  ) => Promise<void>
  deleteDir: (
    entry: DirHandle<FileEntryAdditional, DirEntryAdditional>,
    name: string,
  ) => Promise<void>

  // ファイル操作
  readFile: (entry: FileHandle<FileEntryAdditional>) => Promise<string>
  writeFile: (
    entry: FileHandle<FileEntryAdditional>,
    content: string,
  ) => Promise<void>
  watchFile?: (
    entry: FileHandle<FileEntryAdditional>,
    cb: () => void,
  ) => Promise<void>
  watchDir?: (
    entry: DirHandle<FileEntryAdditional, DirEntryAdditional>,
    cb: () => void,
  ) => Promise<void>

  // Open
  openDir: () => Promise<DirHandle<FileEntryAdditional, DirEntryAdditional>>
  openFile: () => Promise<FileHandle<FileEntryAdditional>>
}
