import Dexie, { type EntityTable } from "dexie"

import type { WebDirEntry, WebFileEntry } from "./io"

export const db = new Dexie("scenario-flow") as Dexie & {
  fileHandleTable: EntityTable<
    Omit<WebFileEntry | WebDirEntry, "files" | "children"> & { isDir: boolean },
    "cacheId"
  >
}

// Schema declaration:
db.version(1).stores({
  fileHandleTable: "++cacheId, handle, name, [path], isDir", // primary key "id" (for the runtime!)
})
