import type { SetStateAction } from "jotai"

export const applyUpdate = <State>(
  update: SetStateAction<State>,
  prevState: State,
): State => {
  if (typeof update === "function") {
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return update(prevState)
  } else {
    return update
  }
}
