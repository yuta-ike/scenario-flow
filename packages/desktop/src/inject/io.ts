import { open } from "@tauri-apps/plugin-dialog"
import {
  readDir,
  open as openFs,
  create,
  watch,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs"

import type { InjectedContent, ProjectEntry } from "@scenario-flow/core"

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

export const openDir: InjectedContent["io"]["openDir"] =
  async (): Promise<ProjectEntry> => {
    const path = await open({
      directory: true,
    })
    if (path == null) {
      throw new Error("No path selected")
    }
    return await _getAllFilesRecursively("", path)
  }

const _getAllFilesRecursively = async (
  name: string,
  dir: string,
): Promise<ProjectEntry> => {
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

export const openFile: InjectedContent["io"]["openFile"] = async () => {
  const path = await open({
    directory: false,
  })
  if (path == null) {
    throw new Error("No path selected")
  }
  return {
    name: path.split("/").pop()!,
    path,
  }
}

export const watchDir: InjectedContent["io"]["watchDir"] = async (
  { path },
  cb,
) => {
  await watch(path, cb, {
    delayMs: 1000,
  })
}

export const readFile: InjectedContent["io"]["readFile"] = async ({ path }) => {
  return await readTextFile(path)
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
