import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

export const formatDistance = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ja })
}
