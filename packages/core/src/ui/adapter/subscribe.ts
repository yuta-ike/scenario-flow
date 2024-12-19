import { useEffect } from "react"

import { store } from "./store"
import { useInjected } from "./container"
import { useProjectContext } from "./ProjectContext"

import type { Json } from "@/utils/json"
import type { DirHandle, FileHandle, InjectedIo } from "@/injector/parts/io"
import type { LocalFileLocation } from "@/domain/entity/resource/resource"

import { decomposedForLibAtom } from "@/domain/selector/decomposedForPlugin"
import { jsonToYaml } from "@/utils/yaml"
import { debouncedLock } from "@/utils/lock"
import { resourcesAtom } from "@/domain/datasource/resource"
import { associateWithList } from "@/utils/set"
import { nonNull } from "@/utils/assert"

const getOrCreateEntryRec = async (
  entry: DirHandle,
  path: string[],
  parent: DirHandle | null,
  createDir: InjectedIo["createDir"],
  projectId: string,
): Promise<[dirHandle: DirHandle, parent: DirHandle | null]> => {
  if (path.length === 0) {
    return [entry, parent]
  }
  const [head, ...tail] = path

  const dir =
    entry.children.find((child) => child.name === head) ??
    (console.log(entry, head!),
    await createDir(entry, head!, { cacheKey: projectId }))

  return await getOrCreateEntryRec(dir, tail, entry, createDir, projectId)
}

export const useWriteOutSubscription = () => {
  const { entry, config, project } = useProjectContext()
  const {
    io: { writeFile, createFile, createDir, deleteFile, deleteDir },
  } = useInjected()

  useEffect(() => {
    let prevModifiedFiles = new Map<
      string,
      { file: FileHandle; dir: DirHandle }
    >()
    let prevModifiedDirs = new Map<string, { dir: DirHandle; name: string }>()
    return store.subscribe(
      decomposedForLibAtom,
      debouncedLock(async () => {
        try {
          console.log("[Write out] Start")
          const decomposedForLib = store.get(decomposedForLibAtom)

          const modifiedFiles = new Map<
            string,
            { file: FileHandle; dir: DirHandle }
          >()
          const modifiedDirs = new Map<
            string,
            { name: string; dir: DirHandle }
          >()

          await Promise.allSettled(
            decomposedForLib.map(async ({ meta, contents }) => {
              try {
                const path = meta.page.split("/").filter((p) => p !== "")
                const [dir, parent] = await getOrCreateEntryRec(
                  entry,
                  path,
                  null,
                  createDir,
                  project.id,
                )
                const file =
                  dir.files.find(
                    (file) =>
                      file.name === `${meta.title}.yaml` ||
                      file.name === `${meta.title}.yml`,
                  ) ??
                  (await createFile(dir, `${meta.title}.yaml`, {
                    cacheKey: project.id,
                  }))
                console.log("[Subscribe] Write out file: ", file.path)
                await writeFile(file, jsonToYaml(contents as Json))
                modifiedFiles.set(file.path, { file, dir })
                if (parent != null) {
                  modifiedDirs.set(dir.path, {
                    name: dir.path.startsWith("/")
                      ? dir.path.slice(1)
                      : dir.path,
                    dir: parent,
                  })
                }
              } catch (e) {
                console.error("[Subscribe]", meta.page, e)
              }
            }),
          )

          // 削除されたRouteに対応するファイルを削除
          const deletedPaths = new Set(prevModifiedFiles.keys()).difference(
            new Set(modifiedFiles.keys()),
          )
          const deletePromises = deletedPaths.values().map(async (path) => {
            const { dir, file } = prevModifiedFiles.get(path)!
            await deleteFile(dir, file.name)
            console.log(`[Subscribe] Delete file: ${dir.path}/${file.name}`)
          })

          // ファイルが存在しないディレクトリを削除
          const deletedDirs = new Set(prevModifiedDirs.keys()).difference(
            new Set(modifiedDirs.keys()),
          )
          console.log("[Subscribe] Prev directories: ", prevModifiedDirs)
          console.log("[Subscribe] Modified directories: ", modifiedDirs)
          const deletDirPromises = deletedDirs.values().map(async (path) => {
            const { name, dir } = prevModifiedDirs.get(path)!
            await deleteDir(dir, name)
            console.log(`[Subscribe] Delete directories: ${dir.path}`)
          })

          const res = await Promise.allSettled([
            ...deletePromises,
            ...deletDirPromises,
          ])
          console.log("[Subscribe] Delete files and directories: ", res)

          prevModifiedFiles = modifiedFiles
          prevModifiedDirs = modifiedDirs
          console.log("[Write out] Finish")
        } catch (e) {
          console.error("[Subscribe]", e)
        }
      }),
    )
  }, [createDir, createFile, deleteDir, deleteFile, entry, writeFile])

  useEffect(() => {
    const writeOutConfig = async () => {
      const resources = store.get(resourcesAtom)

      const rawJson = JSON.stringify(
        {
          ...config,
          resources: Object.fromEntries(
            associateWithList(resources, (resource) => resource.type)
              .entries()
              .map(([type, resources]) => {
                return [
                  type,
                  Object.fromEntries(
                    associateWithList(
                      resources,
                      (resource) => resource.location.locationType,
                    )
                      .entries()
                      .map(([locationType, resources]) => {
                        if (locationType === "local_file") {
                          return [
                            locationType,
                            Object.fromEntries(
                              resources.map((resource) => [
                                resource.name,
                                (resource.location as LocalFileLocation).path,
                              ]),
                            ),
                          ] as const
                        } else {
                          return null
                        }
                      })
                      .filter(nonNull),
                  ),
                ]
              })
              .filter(nonNull),
          ),
        },
        null,
        2,
      )
      const handle = await createFile(entry, "flow.config.json", {
        cacheKey: project.id,
      })
      await writeFile(handle, rawJson)
    }

    void writeOutConfig()

    return store.subscribe(resourcesAtom, writeOutConfig)
  }, [config, createFile, entry, entry.files, writeFile])
}
