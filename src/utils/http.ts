const HTTP_METHODS_DATA = [
  {
    id: "GET",
    label: "GET",
    color: "#2ECC71",
  },
  {
    id: "POST",
    label: "POST",
    color: "#3498DB",
  },
  {
    id: "PUT",
    label: "PUT",
    color: "#9B59B6",
  },
  {
    id: "DELETE",
    label: "DELETE",
    color: "#E74C3C",
  },
  {
    id: "PATCH",
    label: "PATCH",
    color: "#F39C12",
  },
  {
    id: "OPTIONS",
    label: "OPTIONS",
    color: "#34495E",
  },
  {
    id: "HEAD",
    label: "HEAD",
    color: "#E67E22",
  },
  {
    id: "CONNECT",
    label: "CONNECT",
    color: "#1ABC9C",
  },
  {
    id: "TRACE",
    label: "TRACE",
    color: "#7F8C8D",
  },
] as const

type HttpMethodDataItem = (typeof HTTP_METHODS_DATA)[number]

export type HttpMethod = HttpMethodDataItem["id"]

export const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "HEAD",
  "TRACE",
] as const

export const HTTP_METHODS_MAP = Object.fromEntries(
  HTTP_METHODS_DATA.map((data) => [data.id, data]),
) as Record<HttpMethod, HttpMethodDataItem>

export const CONTENT_TYPES = [
  "application/json",
  "application/form-data",
] as const

export type ContentType = (typeof CONTENT_TYPES)[number]
