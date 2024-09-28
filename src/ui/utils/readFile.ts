export const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target == null) {
        reject(new Error("Failed to read file"))
        return
      }
      resolve(e.target.result as string)
    }
    reader.readAsText(file)
  })
}
