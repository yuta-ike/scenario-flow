export type Updater<State> = State | ((prevState: State) => State)

export const applyUpdate = <State>(
  update: Updater<State>,
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
