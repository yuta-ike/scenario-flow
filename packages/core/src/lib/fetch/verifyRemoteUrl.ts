export const verifyRemoteopen_api = async (
  url: string,
): Promise<true | string> => {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      return "リクエストを取得できませんでした"
    }
    await res.json()
    // TODO: バリデーション
    return true
  } catch (e) {
    console.error(structuredClone(e))
    return "無効なデータです"
  }
}