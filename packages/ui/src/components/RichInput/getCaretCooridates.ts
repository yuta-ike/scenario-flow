export const getCaretCoordinates = (
  element: HTMLTextAreaElement,
  position: number,
) => {
  const div = document.createElement("div")
  const style = getComputedStyle(element)

  for (const prop of style) {
    // @ts-expect-error
    div.style[prop as any] = style[prop as any]
  }

  div.style.position = "absolute"
  div.style.visibility = "hidden"
  div.style.whiteSpace = "pre-wrap"
  div.style.wordWrap = "break-word"
  div.style.overflow = "hidden"

  div.textContent = element.value.substring(0, position)

  const span = document.createElement("span")
  span.textContent = element.value.substring(position) || "."
  div.appendChild(span)

  document.body.appendChild(div)
  const { offsetLeft: left, offsetTop: top } = span
  document.body.removeChild(div)

  return { left, top }
}
