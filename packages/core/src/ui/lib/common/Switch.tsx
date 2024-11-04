import * as RxSwitch from "@radix-ui/react-switch"

export const Switch = () => {
  const size = 20

  return (
    <RxSwitch.Root
      className="relative flex h-[var(--switch-size)] cursor-pointer justify-start rounded-full bg-slate-200 p-0.5 shadow-inner outline-none transition data-[state=checked]:bg-green-500"
      style={{
        "-webkit-tap-highlight-color": "rgba(0, 0, 0, 0)",
        "--switch-size": `${size}px`,
        width: size * 1.7,
      }}
    >
      <RxSwitch.Thumb
        className="rounded-full bg-white shadow transition-transform will-change-transform data-[state=checked]:translate-x-[calc(var(--switch-size)*0.7)]"
        style={{
          width: size - 4,
          height: size - 4,
        }}
      />
    </RxSwitch.Root>
  )
}
