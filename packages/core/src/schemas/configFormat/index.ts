import Ajv from "ajv"

import ConfigFormatSchema from "./type/configFormat.gen.json"

import type { ConfigFormat } from "./type/configFormat"

const ajv = new Ajv()

export const validateConfigFormat =
  ajv.compile<ConfigFormat>(ConfigFormatSchema)
