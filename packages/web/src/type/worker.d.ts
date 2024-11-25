declare module "*?worker" {
  const workerConstructor: new (options?: { name?: string }) => Worker
  export default workerConstructor
}
