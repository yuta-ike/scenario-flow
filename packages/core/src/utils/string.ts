export const toLowerCase = <Str extends string>(str: Str): Lowercase<Str> =>
  str.toLowerCase() as Lowercase<Str>

export const toUpperCase = <Str extends string>(str: Str): Uppercase<Str> =>
  str.toUpperCase() as Uppercase<Str>
