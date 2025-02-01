export const nonNull = <T>(value: T): value is NonNullable<T> => value != null
