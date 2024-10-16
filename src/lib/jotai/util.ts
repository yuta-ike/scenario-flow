export type CreateOrUpdate<Create, Updaet = Create> =
  | {
      create: Create
      update?: undefined
      upsert?: undefined
    }
  | {
      create?: undefined
      update: Updaet
      upsert?: undefined
    }
  | {
      create: Create
      update: Updaet
      upsert: true
    }
