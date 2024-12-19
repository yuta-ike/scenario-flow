import "./globals.css"

import Core from "@scenario-flow/core"

import {
  runRunn,
  createFile,
  selectFile,
  getOrCreateFile,
  selectDir,
  watchDir,
  readFile,
  writeFile,
  watchFile,
  createDir,
  deleteFile,
  deleteDir,
} from "./inject"
import { loadStore, saveStore, subscribeStore } from "./inject/store"

import type { InjectedContent } from "@/injector/injector"

const injected: InjectedContent = {
  io: {
    createFile,
    selectFile,
    readFile,
    writeFile,
    getOrCreateFile,
    watchFile,
    selectDir,
    watchDir,
    createDir,
    deleteFile,
    deleteDir,
  },
  exec: {
    libs: {
      runn: {
        run: runRunn,
      },
    },
  },
  fetch: {
    fetch,
  },
  store: {
    loadStore,
    saveStore,
    subscribeStore,
  },
}

function App() {
  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <Core injected={injected} />
    </div>
  )
}

export default App
