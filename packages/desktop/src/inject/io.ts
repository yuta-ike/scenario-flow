import { open } from "@tauri-apps/plugin-dialog"
import {
  readDir,
  open as openFs,
  create,
  remove,
  watch,
  readTextFile,
  writeTextFile,
  mkdir,
} from "@tauri-apps/plugin-fs"

import type { InjectedContent } from "@/injector/injector"
import type { DirHandle } from "@/injector/parts/io"

export const createFile: InjectedContent["io"]["createFile"] = async (
  entry,
  name,
) => {
  const path = `${entry.path}/${name}`
  await create(path)
  return {
    name,
    path,
  }
}

export const createDir: InjectedContent["io"]["createDir"] = async (
  entry,
  name,
) => {
  const path = `${entry.path}/${name}`
  try {
    await mkdir(path)
    return {
      name,
      path,
      files: [],
      children: [],
    }
  } catch (e) {
    if (typeof e === "string" && e.includes("os error 17")) {
      return {
        name,
        path,
        files: [],
        children: [],
      }
    }
    throw e
  }
}

export const selectDir: InjectedContent["io"]["selectDir"] = async (
  _path,
): Promise<DirHandle> => {
  const path =
    _path ??
    (await open({
      directory: true,
      recursive: true,
    }))
  if (path == null) {
    throw new Error("No path selected")
  }
  return await _getAllFilesRecursively("", path)
}

const _getAllFilesRecursively = async (
  name: string,
  dir: string,
): Promise<DirHandle> => {
  const entries = await readDir(dir)
  const files = entries
    .filter(
      (entry) =>
        entry.isFile &&
        !entry.isSymlink &&
        !entry.name.startsWith(".") &&
        (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml")),
    )
    .map((entry) => ({
      name,
      path: `${dir}/${entry.name}`,
      entry,
    }))

  const dirs = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isDirectory && !entry.isSymlink && !entry.name.startsWith("."),
      )
      .map((entry) =>
        _getAllFilesRecursively(entry.name, `${dir}/${entry.name}`),
      ),
  )

  return {
    name,
    path: dir,
    files,
    children: dirs,
  }
}

export const selectFile: InjectedContent["io"]["selectFile"] = async (
  _path,
) => {
  const path =
    _path ??
    (await open({
      directory: false,
      recursive: true,
    }))
  if (path == null) {
    throw new Error("No path selected")
  }
  return {
    name: path.split("/").pop()!,
    path,
  }
}

export const deleteFile: InjectedContent["io"]["deleteFile"] = async (
  { path },
  name,
) => {
  console.log(path, name)
  await remove(`${path}/${name}`)
}

export const watchDir: InjectedContent["io"]["watchDir"] = async (
  { path },
  cb,
) => {
  await watch(path, cb, {
    delayMs: 1000,
  })
}

export const deleteDir: InjectedContent["io"]["deleteDir"] = async (
  entity,
  name,
) => {
  await remove(`${entity.path}/${name}`)
}

const decode = (buffer: ArrayBuffer) => {
  const decoder = new TextDecoder()
  return decoder.decode(buffer)
}

export const readFile: InjectedContent["io"]["readFile"] = async ({ path }) => {
  const raw: string | ArrayBuffer = await readTextFile(path)
  return typeof raw === "string" ? raw : decode(raw)
}

export const writeFile: InjectedContent["io"]["writeFile"] = async (
  { path },
  content,
) => {
  await writeTextFile(path, content)
}

export const getOrCreateFile: InjectedContent["io"]["getOrCreateFile"] = async (
  { path },
  name,
) => {
  const newPath = `${path}/${name}`
  const file = await openFs(newPath, {
    read: true,
    create: true,
    write: true,
  })
  await file.close()
  return {
    name,
    path: newPath,
    handle: file,
  }
}

export const watchFile: InjectedContent["io"]["watchFile"] = async (
  { path },
  cb,
) => {
  await watch(path, cb, {
    delayMs: 1000,
  })
}
