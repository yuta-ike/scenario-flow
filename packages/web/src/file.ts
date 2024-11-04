export const readFile = async (file: File) => {
  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.readAsText(file)
  })
}
