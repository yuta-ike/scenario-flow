export const fetchJson = async <Response = unknown>(
  url: string,
): Promise<Response> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("リクエストを取得できませんでした")
  }
  return res.json() as Response
}
