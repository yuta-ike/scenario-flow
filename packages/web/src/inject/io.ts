import { readFile as readFileObject } from "../file"

import { db } from "./indexeddb"

import type {
  DirHandle,
  FileHandle,
  InjectedContent,
} from "@scenario-flow/core"

declare const cacheId: unique symbol
type CacheId = string & { [cacheId]: never }

type WebFileEntryAdditional = {
  cacheId: CacheId
  handle: FileSystemFileHandle
}
type WebDirEntryAdditional = {
  cacheId: CacheId
  handle: FileSystemDirectoryHandle
}

export type WebInjectedContent = InjectedContent<
  WebFileEntryAdditional,
  WebDirEntryAdditional
>

export type WebFileEntry = FileHandle<WebFileEntryAdditional>
export type WebDirEntry = DirHandle<
  WebFileEntryAdditional,
  WebDirEntryAdditional
>

export const createFile: WebInjectedContent["io"]["createFile"] = async (
  handle,
  name,
  { cacheKey } = {},
) => {
  const fileHandle = await handle.handle.getFileHandle(name, { create: true })

  const cacheId = await db.fileHandleTable.put({
    cacheId: `${handle.path}/${name}-${cacheKey}` as CacheId,
    name,
    path: `${handle.path}/${name}`,
    handle: fileHandle,
    isDir: false,
  })

  return {
    cacheId,
    name,
    path: `${handle.path}/${name}`,
    handle: fileHandle,
  }
}

export const deleteFile: WebInjectedContent["io"]["deleteFile"] = async (
  handle,
  name,
) => {
  await handle.handle.removeEntry(name)
}

export const createDir: WebInjectedContent["io"]["createDir"] = async (
  handle,
  name,
  { cacheKey } = {},
) => {
  const dirHandle = await handle.handle.getDirectoryHandle(name, {
    create: true,
  })

  const cacheId = await db.fileHandleTable.put({
    cacheId: `${handle.path}/${name}-${cacheKey}` as CacheId,
    name,
    path: `${handle.path}/${name}`,
    handle: dirHandle,
    isDir: true,
  })

  return {
    cacheId,
    name,
    path: `${handle.path}/${name}`,
    handle: dirHandle,
    children: [],
    files: [],
  }
}

export const deleteDir: WebInjectedContent["io"]["deleteDir"] = async (
  handle,
  name,
) => {
  await handle.handle.removeEntry(name)
}

const getSelectDir = async (path?: string, cacheKey?: string) => {
  if (path != null) {
    const data = (await db.fileHandleTable.toArray()).find(
      (data) => data.cacheId === `${path}-${cacheKey}`,
    )
    if (data?.isDir === true) {
      return data.handle as FileSystemDirectoryHandle
    }
  }
  console.log(path)
  return await window.showDirectoryPicker()
}

export const selectDir: WebInjectedContent["io"]["selectDir"] = async (
  path,
  { cacheKey } = {},
): Promise<WebDirEntry> => {
  const dirHandle = await getSelectDir(path, cacheKey)
  const res = await _getAllFilesRecursively(
    "",
    dirHandle.name,
    dirHandle,
    cacheKey,
  )
  return res
}

const _getAllFilesRecursively = async (
  name: string,
  path: string,
  dirHandle: FileSystemDirectoryHandle,
  cacheKey?: string,
): Promise<WebDirEntry> => {
  const entries = dirHandle.entries()

  const files: WebFileEntry[] = []
  const projects: WebDirEntry[] = []

  for await (const [name, fileOrDirHandle] of entries) {
    if (fileOrDirHandle.kind === "file") {
      if (name.endsWith(".yaml") || name.endsWith(".yml")) {
        const cacheId = await db.fileHandleTable.put({
          cacheId: `${path}/${name}-${cacheKey}` as CacheId,
          name,
          path: `${path}/${name}`,
          handle: fileOrDirHandle,
          isDir: false,
        })

        files.push({
          cacheId,
          name,
          path: `${path}/${name}`,
          handle: fileOrDirHandle,
        })
      }
    } else {
      const projectEntry = await _getAllFilesRecursively(
        name,
        `${path}/${name}`,
        fileOrDirHandle,
        cacheKey,
      )
      projects.push(projectEntry)
    }
  }

  const cacheId = await db.fileHandleTable.put({
    cacheId: `${path}-${cacheKey}` as CacheId,
    name,
    path,
    handle: dirHandle,
    isDir: true,
  })

  return {
    cacheId,
    name,
    path,
    files,
    children: projects,
    handle: dirHandle,
  }
}

// @ts-expect-error
export const selectFile: WebInjectedContent["io"]["selectFile"] = async (
  path,
  { silent = false, cacheKey } = {},
) => {
  if (path != null) {
    const data = (await db.fileHandleTable.toArray()).find(
      (data) => data.cacheId === `${path}-${cacheKey}`,
    )
    if (data?.isDir === false) {
      return data as WebFileEntry
    }
  }

  if (silent) {
    return null
  }

  const [fileHandle] = await window.showOpenFilePicker()

  const cacheId = await db.fileHandleTable.put({
    cacheId: `${fileHandle.name}-${cacheKey}` as CacheId,
    name: "",
    path: fileHandle.name,
    handle: fileHandle,
    isDir: false,
  })

  return {
    cacheId,
    name: "",
    path: fileHandle.name,
    handle: fileHandle,
  }
}

export const readFile: WebInjectedContent["io"]["readFile"] = async ({
  handle,
}) => {
  const file = await handle.getFile()
  const content = await readFileObject(file)
  return content
}

export const writeFile: WebInjectedContent["io"]["writeFile"] = async (
  { handle },
  contets,
) => {
  const writable = await handle.createWritable()
  await writable.write(contets)
  await writable.close()
}

export const getOrCreateFile: WebInjectedContent["io"]["getOrCreateFile"] =
  async ({ handle, path }, name, { cacheKey } = {}) => {
    const fileHandle = await handle.getFileHandle(name, { create: true })
    const cacheId = await db.fileHandleTable.put({
      cacheId: `${path}/${name}-${cacheKey}` as CacheId,
      path: `${path}/${name}`,
      name,
      handle: fileHandle,
      isDir: false,
    })

    return {
      cacheId,
      path: `${path}/${name}`,
      name,
      handle: fileHandle,
    }
  }
