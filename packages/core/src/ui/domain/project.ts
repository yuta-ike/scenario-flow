import { genId } from "@/utils/uuid"

export type Project = {
  id: string
  name: string
  createdAt: string
  lastModified: string
  path: string
}

export const Project = (
  params: Omit<Project, "id" | "createdAt" | "lastModified"> & {
    id?: string
  },
): Project => {
  return {
    id: genId(),
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    ...params,
  }
}

export const updateLastModified = (project: Project): Project => {
  return {
    ...project,
    lastModified: new Date().toISOString(),
  }
}
