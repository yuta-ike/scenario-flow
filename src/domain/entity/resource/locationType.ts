export const LOCATION_TYPE_LIST = [
  {
    type: "Temporal",
    label: "アップロード",
  },
  {
    type: "LocalFile",
    label: "ローカルファイルから読み込み",
  },
  {
    type: "Remote",
    label: "URLからの読み込み",
  },
  {
    type: "Git",
    label: "Git連携",
  },
] as const

export const LOCATION_TYPES = LOCATION_TYPE_LIST.map(
  (locationType) => locationType.type,
)

export type LocationType = (typeof LOCATION_TYPES)[number]

export const LOCATION_TYPE_MAP = LOCATION_TYPE_LIST.reduce((map, item) => {
  map.set(item.type, item)
  return map
}, new Map<LocationType, (typeof LOCATION_TYPE_LIST)[number]>())
