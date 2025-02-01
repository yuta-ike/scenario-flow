/* eslint-disable @typescript-eslint/no-deprecated */

import type {
  FileInfo,
  ResolverOptions,
} from "@apidevtools/json-schema-ref-parser"

const isWindowsConst =
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  (globalThis.process ? globalThis.process.platform : "").startsWith("win")
const isWindows = () => isWindowsConst

const forwardSlashPattern = /\//g
const urlDecodePatterns = [
  /%23/g,
  "#",
  /%24/g,
  "$",
  /%26/g,
  "&",
  /%2C/g,
  ",",
  /%40/g,
  "@",
]

const toFileSystemPath = (
  path: string | undefined,
  keepFileProtocol?: boolean,
): string => {
  // Step 1: `decodeURI` will decode characters such as Cyrillic characters, spaces, etc.
  path = decodeURI(path!)

  // Step 2: Manually decode characters that are not decoded by `decodeURI`.
  // This includes characters such as "#" and "?", which have special meaning in URLs,
  // but are just normal characters in a filesystem path.
  for (let i = 0; i < urlDecodePatterns.length; i += 2) {
    path = path.replace(
      urlDecodePatterns[i]!,
      urlDecodePatterns[i + 1] as string,
    )
  }

  // Step 3: If it's a "file://" URL, then format it consistently
  // or convert it to a local filesystem path
  let isFileUrl = path.substr(0, 7).toLowerCase() === "file://"
  if (isFileUrl) {
    // Strip-off the protocol, and the initial "/", if there is one
    path = path[7] === "/" ? path.substr(8) : path.substr(7)

    // insert a colon (":") after the drive letter on Windows
    if (isWindows() && path[1] === "/") {
      path = path[0]! + ":" + path.substr(1)
    }

    if (keepFileProtocol === true) {
      // Return the consistently-formatted "file://" URL
      path = "file:///" + path
    } else {
      // Convert the "file://" URL to a local filesystem path.
      // On Windows, it will start with something like "C:/".
      // On Posix, it will start with "/"
      isFileUrl = false
      path = isWindows() ? path : "/" + path
    }
  }

  // Step 4: Normalize Windows paths (unless it's a "file://" URL)
  if (isWindows() && !isFileUrl) {
    // Replace forward slashes with backslashes
    path = path.replace(forwardSlashPattern, "\\")

    // Capitalize the drive letter
    if (path.substr(1, 2) === ":\\") {
      path = path[0]!.toUpperCase() + path.substr(1)
    }
  }

  return path
}

export default (
  readExternalFile: (path: string) => Promise<string>,
): ResolverOptions => ({
  order: 100,
  canRead: true,
  read: async (file: FileInfo): Promise<Buffer> => {
    const path = new URL(file.url).pathname
    // const path = toFileSystemPath(file.url)
    console.log(path)
    const str = await readExternalFile(path)
    console.log(str)
    return Buffer.from(str, "utf-8")
  },
})
