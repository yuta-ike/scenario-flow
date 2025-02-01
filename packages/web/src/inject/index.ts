import {
  createDir,
  createFile,
  deleteDir,
  deleteFile,
  getOrCreateFile,
  selectDir,
  selectFile,
  readFile,
  writeFile,
} from "./io"
import { loadStore, saveStore, subscribeStore } from "./store"

import type { InjectedContent } from "@scenario-flow/app"

export const injectedContent = {
  io: {
    createFile,
    deleteFile,
    createDir,
    deleteDir,
    readFile,
    writeFile,
    getOrCreateFile,
    selectDir,
    selectFile,
  },
  exec: {
    libs: {},
  },
  fetch: {
    fetch: window.fetch,
  },
  store: {
    loadStore,
    saveStore,
    subscribeStore,
  },
} as unknown as InjectedContent
