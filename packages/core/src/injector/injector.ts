import type { Result } from "@/utils/result"

export type RunResult = {
  id: string
  result: "success" | "failure" | "skipped"
  steps: {
    key: string /* node.name */
    result: "success" | "failure" | "skipped"
  }[]
}[]

// TODO: ProjectEntryがchildrenを持たない方が良い。

export type ProjectEntry<
  FileEntryAdditional extends Record<string, unknown> = Record<string, unknown>,
  DirEntryAdditional extends Record<string, unknown> = FileEntryAdditional,
> = {
  name: string
  path: string
  files: FileEntry<FileEntryAdditional>[]
  children: ProjectEntry<FileEntryAdditional, DirEntryAdditional>[]
} & DirEntryAdditional

export type FileEntry<
  EntryAdditional extends Record<string, unknown> = Record<string, unknown>,
> = {
  name: string
  path: string
} & EntryAdditional

export type InjectedContentExecRunner = (
  paths: string[],
) => Promise<Result<string, string>>

export type InjectedContentExec = {
  libs?: Record<
    string,
    {
      run?: InjectedContentExecRunner
    }
  >
}

export type InjectedContent<
  FileEntryAdditional extends Record<string, unknown> = Record<string, unknown>,
  DirEntryAdditional extends Record<string, unknown> = FileEntryAdditional,
> = {
  io: {
    // ファイルシステム操作
    createFile: (
      entry: ProjectEntry<FileEntryAdditional, DirEntryAdditional>,
      name: string,
    ) => Promise<FileEntry<FileEntryAdditional>>
    getOrCreateFile: (
      entry: ProjectEntry<FileEntryAdditional, DirEntryAdditional>,
      name: string,
    ) => Promise<FileEntry<FileEntryAdditional>>

    // ファイル操作
    readFile: (entry: FileEntry<FileEntryAdditional>) => Promise<string>
    writeFile: (
      entry: FileEntry<FileEntryAdditional>,
      content: string,
    ) => Promise<void>
    watchFile?: (
      entry: FileEntry<FileEntryAdditional>,
      cb: () => void,
    ) => Promise<void>
    watchDir?: (
      entry: ProjectEntry<FileEntryAdditional, DirEntryAdditional>,
      cb: () => void,
    ) => Promise<void>

    // Open
    openDir: () => Promise<
      ProjectEntry<FileEntryAdditional, DirEntryAdditional>
    >
    openFile: () => Promise<FileEntry<FileEntryAdditional>>
  }

  exec: InjectedContentExec

  fetch: {
    fetch?: typeof window.fetch
  }
}

let injectStore: InjectedContent

export const setInjectedContent = <
  FileEntryAdditional extends Record<string, unknown> = Record<string, unknown>,
  DirEntryAdditional extends Record<string, unknown> = FileEntryAdditional,
>(
  content: InjectedContent<FileEntryAdditional, DirEntryAdditional>,
) => {
  injectStore = content as unknown as InjectedContent
}

export const getInjectedContent = () => {
  return injectStore
}

export const useInjectedContent = () => getInjectedContent()
