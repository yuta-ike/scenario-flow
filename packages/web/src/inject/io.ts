import { readFile as readFileObject } from "../file"

import type { InjectedContent } from "@/injector/injector"
import type { DirHandle, FileHandle } from "@/injector/parts/io"

type WebFileEntryAdditional = {
  handle: FileSystemFileHandle
}
type WebDirEntryAdditional = {
  handle: FileSystemDirectoryHandle
}

type WebInjectedContent = InjectedContent<
  WebFileEntryAdditional,
  WebDirEntryAdditional
>
type WebProjectEntry = DirHandle<WebFileEntryAdditional, WebDirEntryAdditional>

type WebFileEntry = FileHandle<WebFileEntryAdditional>

export const createFile: WebInjectedContent["io"]["createFile"] = async (
  handle,
  name,
) => {
  const fileHandle = await handle.handle.getFileHandle(name, { create: true })
  return { name, path: `${handle.path}/${name}`, handle: fileHandle }
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
) => {
  const dirHandle = await handle.handle.getDirectoryHandle(name, {
    create: true,
  })
  return {
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

export const openDir: WebInjectedContent["io"]["openDir"] =
  async (): Promise<WebProjectEntry> => {
    const dirHandle = await window.showDirectoryPicker()
    const res = await _getAllFilesRecursively("", "", dirHandle)
    return res
  }

const _getAllFilesRecursively = async (
  name: string,
  path: string,
  dirHandle: FileSystemDirectoryHandle,
): Promise<WebProjectEntry> => {
  const entries = dirHandle.entries()

  const files: WebFileEntry[] = []
  const projects: WebProjectEntry[] = []

  for await (const [name, fileOrDirHandle] of entries) {
    if (fileOrDirHandle.kind === "file") {
      if (name.endsWith(".yaml") || name.endsWith(".yml")) {
        files.push({ name, path: `${path}/${name}`, handle: fileOrDirHandle })
      }
    } else {
      const projectEntry = await _getAllFilesRecursively(
        name,
        `${path}/${name}`,
        fileOrDirHandle,
      )
      projects.push(projectEntry)
    }
  }

  return {
    name,
    path,
    files,
    children: projects,
    handle: dirHandle,
  }
}

export const openFile: WebInjectedContent["io"]["openFile"] = async () => {
  const [fileHandle] = await window.showOpenFilePicker()

  return { name: fileHandle.name, path: "", handle: fileHandle }
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
  async ({ handle, path }, name) => {
    const fileHandle = await handle.getFileHandle(name, { create: true })
    return { path: `${path}/${name}`, name, handle: fileHandle }
  }
