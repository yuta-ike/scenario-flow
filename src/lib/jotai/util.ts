export type CreateOrUpdate<Create, Updaet = Create> =
  | {
      create: Create
      update?: undefined
    }
  | {
      create?: undefined
      update: Updaet
    }
