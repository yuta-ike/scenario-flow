import Ajv from "ajv"

import RunBookSchema from "./type/runbook.gen.json"

import type { RunBook } from "./type"

const ajv = new Ajv()

export const validateRunn = ajv.compile<RunBook>(RunBookSchema)

// export const serializeRunn = ajv.compileSerializer<RunBook>(RunBookSchema)

// export const parseRunn = ajv.compileParser<RunBook>(RunBookSchema)
