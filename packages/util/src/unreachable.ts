export const throwUnreachable = (data?: never): never => {
  throw new Error(`Unreachable: ${data}`)
}
