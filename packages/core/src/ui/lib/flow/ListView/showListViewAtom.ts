import { atom, useAtomValue, useSetAtom } from "jotai"

const showListViewAtom = atom(false)

export const useShowListView = () => useAtomValue(showListViewAtom)

export const useSetShowListView = () => useSetAtom(showListViewAtom)
