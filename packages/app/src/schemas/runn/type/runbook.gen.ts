// To parse this data:
//
//   import { Convert, RunBook } from "./file";
//
//   const runBook = Convert.toRunBook(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface RunBook {
    $schema:     string;
    definitions: Definitions;
}

export interface Definitions {
    JsonPrimitive:                JSONPrimitive;
    JsonArray:                    JSONArray;
    JsonObject:                   JSONObject;
    Json:                         JSON;
    ContentType:                  ContentType;
    RunBook:                      RunBookClass;
    RunBookStepLoopConfig:        RunBookStepLoopConfig;
    RunBookStepPathsObject:       RecordStringRunBookStep;
    RunBookStepPathItemObject:    RecordStringRunBookStep;
    RunBookStepOperationObject:   RunBookStepOperationObject;
    RunBookStepMediaTypeObject:   RunBookStepMediaTypeObject;
    RunBookStepIncludeObject:     RunBookStepIncludeObject;
    RunBookStep:                  RunBookStep;
    "Record<string,RunBookStep>": RecordStringRunBookStep;
    "Record<string,string>":      RecordStringRunBookStep;
    "Record<ContentType,Json>":   RecordContentTypeJSON;
}

export interface ContentType {
    title: string;
    enum:  string[];
    type:  TypeElement;
}

export enum TypeElement {
    Boolean = "boolean",
    Null = "null",
    Number = "number",
    String = "string",
}

export interface JSON {
    title: string;
    anyOf: JSONAnyOf[];
}

export interface JSONAnyOf {
    $ref?:  string;
    type?:  TypeElement[] | string;
    items?: RunBookStepMediaTypeObject;
}

export interface RunBookStepMediaTypeObject {
    $ref: string;
}

export interface JSONArray {
    title: string;
    anyOf: JSONArrayAnyOf[];
}

export interface JSONArrayAnyOf {
    type:  string;
    items: RunBookStepMediaTypeObject;
}

export interface JSONObject {
    title:                string;
    type:                 string;
    additionalProperties: AdditionalProperties;
}

export interface AdditionalProperties {
    anyOf: JSONAnyOf[];
}

export interface JSONPrimitive {
    title: string;
    type:  TypeElement[];
}

export interface RecordContentTypeJSON {
    title:                string;
    type:                 string;
    properties:           RecordContentTypeJSONProperties;
    additionalProperties: boolean;
    required:             string[];
}

export interface RecordContentTypeJSONProperties {
    "application/json":      ApplicationFormData;
    "application/form-data": ApplicationFormData;
}

export interface ApplicationFormData {
    $ref:  string;
    title: string;
}

export interface RecordStringRunBookStep {
    title:                string;
    type:                 string;
    additionalProperties: boolean;
}

export interface RunBookClass {
    type:                 string;
    properties:           RunBookProperties;
    additionalProperties: boolean;
    required:             string[];
}

export interface RunBookProperties {
    desc:        Debug;
    labels:      Labels;
    needs:       Needs;
    runners:     Needs;
    vars:        Needs;
    steps:       Steps;
    hostRules:   Concurrency;
    debug:       Debug;
    interval:    Debug;
    if:          Debug;
    skipTest:    Debug;
    loop:        Concurrency;
    concurrency: Concurrency;
    force:       Debug;
    trace:       Debug;
}

export interface Concurrency {
    title: string;
}

export interface Debug {
    type:  TypeElement;
    title: string;
}

export interface Labels {
    type:  string;
    items: Items;
    title: string;
}

export interface Items {
    type: TypeElement;
}

export interface Needs {
    type:                 string;
    additionalProperties: Items;
    title:                string;
}

export interface Steps {
    anyOf: StepsAnyOf[];
    title: string;
}

export interface StepsAnyOf {
    $ref?:  string;
    type?:  string;
    items?: RunBookStep;
}

export interface RunBookStep {
    type:                 string;
    properties:           RunBookStepProperties;
    additionalProperties: boolean;
}

export interface RunBookStepProperties {
    desc:    Debug;
    if:      Debug;
    loop:    RunBookStepLoopConfig;
    req:     ApplicationFormData;
    test:    Debug;
    include: RunBookStepIncludeObject;
    bind:    ApplicationFormData;
}

export interface RunBookStepIncludeObject {
    type:                 string;
    properties:           RunBookStepIncludeObjectProperties;
    additionalProperties: boolean;
    required:             string[];
    title?:               string;
}

export interface RunBookStepIncludeObjectProperties {
    path: Debug;
    vars: ApplicationFormData;
}

export interface RunBookStepLoopConfig {
    anyOf: RunBookStepLoopConfigAnyOf[];
    title: string;
}

export interface RunBookStepLoopConfigAnyOf {
    type:                  string;
    properties?:           AnyOfProperties;
    additionalProperties?: boolean;
}

export interface AnyOfProperties {
    count:       Debug;
    interval:    JSONPrimitive;
    minInterval: JSONPrimitive;
    maxInterval: JSONPrimitive;
    jutter:      Debug;
    multiplier:  Debug;
    until:       Debug;
}

export interface RunBookStepOperationObject {
    type:                 string;
    properties:           RunBookStepOperationObjectProperties;
    additionalProperties: boolean;
}

export interface RunBookStepOperationObjectProperties {
    headers: ApplicationFormData;
    cookies: ApplicationFormData;
    body:    ApplicationFormData;
    trace:   Debug;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toRunBook(json: string): RunBook {
        return cast(JSON.parse(json), r("RunBook"));
    }

    public static runBookToJson(value: RunBook): string {
        return JSON.stringify(uncast(value, r("RunBook")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "RunBook": o([
        { json: "$schema", js: "$schema", typ: "" },
        { json: "definitions", js: "definitions", typ: r("Definitions") },
    ], false),
    "Definitions": o([
        { json: "JsonPrimitive", js: "JsonPrimitive", typ: r("JSONPrimitive") },
        { json: "JsonArray", js: "JsonArray", typ: r("JSONArray") },
        { json: "JsonObject", js: "JsonObject", typ: r("JSONObject") },
        { json: "Json", js: "Json", typ: r("JSON") },
        { json: "ContentType", js: "ContentType", typ: r("ContentType") },
        { json: "RunBook", js: "RunBook", typ: r("RunBookClass") },
        { json: "RunBookStepLoopConfig", js: "RunBookStepLoopConfig", typ: r("RunBookStepLoopConfig") },
        { json: "RunBookStepPathsObject", js: "RunBookStepPathsObject", typ: r("RecordStringRunBookStep") },
        { json: "RunBookStepPathItemObject", js: "RunBookStepPathItemObject", typ: r("RecordStringRunBookStep") },
        { json: "RunBookStepOperationObject", js: "RunBookStepOperationObject", typ: r("RunBookStepOperationObject") },
        { json: "RunBookStepMediaTypeObject", js: "RunBookStepMediaTypeObject", typ: r("RunBookStepMediaTypeObject") },
        { json: "RunBookStepIncludeObject", js: "RunBookStepIncludeObject", typ: r("RunBookStepIncludeObject") },
        { json: "RunBookStep", js: "RunBookStep", typ: r("RunBookStep") },
        { json: "Record<string,RunBookStep>", js: "Record<string,RunBookStep>", typ: r("RecordStringRunBookStep") },
        { json: "Record<string,string>", js: "Record<string,string>", typ: r("RecordStringRunBookStep") },
        { json: "Record<ContentType,Json>", js: "Record<ContentType,Json>", typ: r("RecordContentTypeJSON") },
    ], false),
    "ContentType": o([
        { json: "title", js: "title", typ: "" },
        { json: "enum", js: "enum", typ: a("") },
        { json: "type", js: "type", typ: r("TypeElement") },
    ], false),
    "JSON": o([
        { json: "title", js: "title", typ: "" },
        { json: "anyOf", js: "anyOf", typ: a(r("JSONAnyOf")) },
    ], false),
    "JSONAnyOf": o([
        { json: "$ref", js: "$ref", typ: u(undefined, "") },
        { json: "type", js: "type", typ: u(undefined, u(a(r("TypeElement")), "")) },
        { json: "items", js: "items", typ: u(undefined, r("RunBookStepMediaTypeObject")) },
    ], false),
    "RunBookStepMediaTypeObject": o([
        { json: "$ref", js: "$ref", typ: "" },
    ], false),
    "JSONArray": o([
        { json: "title", js: "title", typ: "" },
        { json: "anyOf", js: "anyOf", typ: a(r("JSONArrayAnyOf")) },
    ], false),
    "JSONArrayAnyOf": o([
        { json: "type", js: "type", typ: "" },
        { json: "items", js: "items", typ: r("RunBookStepMediaTypeObject") },
    ], false),
    "JSONObject": o([
        { json: "title", js: "title", typ: "" },
        { json: "type", js: "type", typ: "" },
        { json: "additionalProperties", js: "additionalProperties", typ: r("AdditionalProperties") },
    ], false),
    "AdditionalProperties": o([
        { json: "anyOf", js: "anyOf", typ: a(r("JSONAnyOf")) },
    ], false),
    "JSONPrimitive": o([
        { json: "title", js: "title", typ: "" },
        { json: "type", js: "type", typ: a(r("TypeElement")) },
    ], false),
    "RecordContentTypeJSON": o([
        { json: "title", js: "title", typ: "" },
        { json: "type", js: "type", typ: "" },
        { json: "properties", js: "properties", typ: r("RecordContentTypeJSONProperties") },
        { json: "additionalProperties", js: "additionalProperties", typ: true },
        { json: "required", js: "required", typ: a("") },
    ], false),
    "RecordContentTypeJSONProperties": o([
        { json: "application/json", js: "application/json", typ: r("ApplicationFormData") },
        { json: "application/form-data", js: "application/form-data", typ: r("ApplicationFormData") },
    ], false),
    "ApplicationFormData": o([
        { json: "$ref", js: "$ref", typ: "" },
        { json: "title", js: "title", typ: "" },
    ], false),
    "RecordStringRunBookStep": o([
        { json: "title", js: "title", typ: "" },
        { json: "type", js: "type", typ: "" },
        { json: "additionalProperties", js: "additionalProperties", typ: true },
    ], false),
    "RunBookClass": o([
        { json: "type", js: "type", typ: "" },
        { json: "properties", js: "properties", typ: r("RunBookProperties") },
        { json: "additionalProperties", js: "additionalProperties", typ: true },
        { json: "required", js: "required", typ: a("") },
    ], false),
    "RunBookProperties": o([
        { json: "desc", js: "desc", typ: r("Debug") },
        { json: "labels", js: "labels", typ: r("Labels") },
        { json: "needs", js: "needs", typ: r("Needs") },
        { json: "runners", js: "runners", typ: r("Needs") },
        { json: "vars", js: "vars", typ: r("Needs") },
        { json: "steps", js: "steps", typ: r("Steps") },
        { json: "hostRules", js: "hostRules", typ: r("Concurrency") },
        { json: "debug", js: "debug", typ: r("Debug") },
        { json: "interval", js: "interval", typ: r("Debug") },
        { json: "if", js: "if", typ: r("Debug") },
        { json: "skipTest", js: "skipTest", typ: r("Debug") },
        { json: "loop", js: "loop", typ: r("Concurrency") },
        { json: "concurrency", js: "concurrency", typ: r("Concurrency") },
        { json: "force", js: "force", typ: r("Debug") },
        { json: "trace", js: "trace", typ: r("Debug") },
    ], false),
    "Concurrency": o([
        { json: "title", js: "title", typ: "" },
    ], false),
    "Debug": o([
        { json: "type", js: "type", typ: r("TypeElement") },
        { json: "title", js: "title", typ: "" },
    ], false),
    "Labels": o([
        { json: "type", js: "type", typ: "" },
        { json: "items", js: "items", typ: r("Items") },
        { json: "title", js: "title", typ: "" },
    ], false),
    "Items": o([
        { json: "type", js: "type", typ: r("TypeElement") },
    ], false),
    "Needs": o([
        { json: "type", js: "type", typ: "" },
        { json: "additionalProperties", js: "additionalProperties", typ: r("Items") },
        { json: "title", js: "title", typ: "" },
    ], false),
    "Steps": o([
        { json: "anyOf", js: "anyOf", typ: a(r("StepsAnyOf")) },
        { json: "title", js: "title", typ: "" },
    ], false),
    "StepsAnyOf": o([
        { json: "$ref", js: "$ref", typ: u(undefined, "") },
        { json: "type", js: "type", typ: u(undefined, "") },
        { json: "items", js: "items", typ: u(undefined, r("RunBookStep")) },
    ], false),
    "RunBookStep": o([
        { json: "type", js: "type", typ: "" },
        { json: "properties", js: "properties", typ: r("RunBookStepProperties") },
        { json: "additionalProperties", js: "additionalProperties", typ: true },
    ], false),
    "RunBookStepProperties": o([
        { json: "desc", js: "desc", typ: r("Debug") },
        { json: "if", js: "if", typ: r("Debug") },
        { json: "loop", js: "loop", typ: r("RunBookStepLoopConfig") },
        { json: "req", js: "req", typ: r("ApplicationFormData") },
        { json: "test", js: "test", typ: r("Debug") },
        { json: "include", js: "include", typ: r("RunBookStepIncludeObject") },
        { json: "bind", js: "bind", typ: r("ApplicationFormData") },
    ], false),
    "RunBookStepIncludeObject": o([
        { json: "type", js: "type", typ: "" },
        { json: "properties", js: "properties", typ: r("RunBookStepIncludeObjectProperties") },
        { json: "additionalProperties", js: "additionalProperties", typ: true },
        { json: "required", js: "required", typ: a("") },
        { json: "title", js: "title", typ: u(undefined, "") },
    ], false),
    "RunBookStepIncludeObjectProperties": o([
        { json: "path", js: "path", typ: r("Debug") },
        { json: "vars", js: "vars", typ: r("ApplicationFormData") },
    ], false),
    "RunBookStepLoopConfig": o([
        { json: "anyOf", js: "anyOf", typ: a(r("RunBookStepLoopConfigAnyOf")) },
        { json: "title", js: "title", typ: "" },
    ], false),
    "RunBookStepLoopConfigAnyOf": o([
        { json: "type", js: "type", typ: "" },
        { json: "properties", js: "properties", typ: u(undefined, r("AnyOfProperties")) },
        { json: "additionalProperties", js: "additionalProperties", typ: u(undefined, true) },
    ], false),
    "AnyOfProperties": o([
        { json: "count", js: "count", typ: r("Debug") },
        { json: "interval", js: "interval", typ: r("JSONPrimitive") },
        { json: "minInterval", js: "minInterval", typ: r("JSONPrimitive") },
        { json: "maxInterval", js: "maxInterval", typ: r("JSONPrimitive") },
        { json: "jutter", js: "jutter", typ: r("Debug") },
        { json: "multiplier", js: "multiplier", typ: r("Debug") },
        { json: "until", js: "until", typ: r("Debug") },
    ], false),
    "RunBookStepOperationObject": o([
        { json: "type", js: "type", typ: "" },
        { json: "properties", js: "properties", typ: r("RunBookStepOperationObjectProperties") },
        { json: "additionalProperties", js: "additionalProperties", typ: true },
    ], false),
    "RunBookStepOperationObjectProperties": o([
        { json: "headers", js: "headers", typ: r("ApplicationFormData") },
        { json: "cookies", js: "cookies", typ: r("ApplicationFormData") },
        { json: "body", js: "body", typ: r("ApplicationFormData") },
        { json: "trace", js: "trace", typ: r("Debug") },
    ], false),
    "TypeElement": [
        "boolean",
        "null",
        "number",
        "string",
    ],
};
