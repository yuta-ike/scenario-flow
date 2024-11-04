import { setInjectedContent } from "@scenario-flow/core"
import { fetch } from "@tauri-apps/plugin-http"

import {
  readFile,
  writeFile,
  getOrCreateFile,
  watchFile,
  openDir,
  watchDir,
  openFile,
  createFile,
} from "./io"
import { runRunn } from "./exec"

setInjectedContent({
  io: {
    createFile,
    openFile,
    readFile,
    writeFile,
    getOrCreateFile,
    watchFile,
    openDir,
    watchDir,
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
})
