import { atom, useAtomValue, useSetAtom } from "jotai"
import { useStore } from "../../provider"

const showListViewAtom = atom(false)

export const useShowListView = () =>
  useAtomValue(showListViewAtom, { store: useStore().store })

export const useSetShowListView = () =>
  useSetAtom(showListViewAtom, { store: useStore().store })
