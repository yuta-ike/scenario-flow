import { Fragment } from "react"
import { FiChevronRight } from "react-icons/fi"

type Props = {
  path: string
}

export const PathChip = ({ path }: Props) => {
  const frags = path.split("/").filter((frag) => frag !== "")
  return (
    <div className="flex items-center gap-px">
      {frags.map((frag, i) => (
        <Fragment key={`${frag}-${i}`}>
          <button
            onClick={() => {}}
            type="button"
            className="rounded p-2 py-1 text-sm leading-none text-slate-600 transition hover:bg-slate-100 active:translate-y-px"
          >
            {frag}
          </button>
          {i !== frags.length - 1 && (
            <div>
              <FiChevronRight size={14} />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  )
}
