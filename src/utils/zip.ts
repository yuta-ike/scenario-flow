import { downloadZip } from "client-zip"

export const zipFiles = async (files: File[]) => {
  const blob = await downloadZip(files).blob()
  return blob
}
