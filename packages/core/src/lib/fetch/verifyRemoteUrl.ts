export const verifyRemoteOpenApi = async (
  url: string,
): Promise<true | string> => {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      return "リクエストを取得できませんでした"
    }
    await res.json()
    return true
  } catch (e) {
    console.error(structuredClone(e))
    return "無効なデータです"
  }
}
