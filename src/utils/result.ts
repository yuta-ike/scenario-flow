export type Result<Success, Err = unknown> =
  | {
      result: "success"
      value: Success
      error: undefined
    }
  | {
      result: "error"
      value: undefined
      error: Err
    }

export const tryFn = <Return, Err = unknown>(
  func: () => Return,
): Result<Return, Err> => {
  try {
    return {
      result: "success",
      value: func(),
      error: undefined,
    }
  } catch (error) {
    return {
      result: "error",
      value: undefined,
      error: error as Err,
    }
  }
}
export const map = <Success, Error, NewSuccess = Success, NewError = Error>(
  result: Result<Success, Error>,
  onSuccess: (value: Success) => NewSuccess,
  onError: (error: Error) => NewError,
) => {
  if (result.result === "success") {
    return {
      result: "success",
      error: undefined,
      value: onSuccess(result.value),
    }
  } else {
    return { result: "error", error: onError(result.error), value: undefined }
  }
}

export const mapSuccess = <Success, Error, NewSuccess = Success>(
  result: Result<Success, Error>,
  onSuccess: (value: Success) => NewSuccess,
) => map(result, onSuccess, () => {})

export const mapError = <Success, Error, NewError = Error>(
  result: Result<Success, Error>,
  onError: (error: Error) => NewError,
) => map(result, () => {}, onError)
