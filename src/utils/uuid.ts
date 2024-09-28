import { customAlphabet } from "nanoid"
import { Id } from "./idType"

const nanoId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  16,
)

export const genId = (): Id => nanoId() as Id
