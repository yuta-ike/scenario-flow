import { setInjectedContent } from "@scenario-flow/core"

import {
  readFile,
  writeFile,
  getOrCreateFile,
  openDir,
  openFile,
  createFile,
} from "./io"

setInjectedContent({
  io: {
    createFile,
    readFile,
    writeFile,
    getOrCreateFile,
    openDir,
    openFile,
  },
  exec: {
    libs: {},
  },
  fetch: {
    fetch: window.fetch,
  },
})
