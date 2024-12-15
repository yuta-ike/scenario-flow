import {
  createDir,
  createFile,
  deleteDir,
  deleteFile,
  getOrCreateFile,
  openDir,
  openFile,
  readFile,
  writeFile,
} from "./io"

export const injectedContent = {
  io: {
    createFile,
    deleteFile,
    createDir,
    deleteDir,
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
}
