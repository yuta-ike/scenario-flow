export type Receiver<
  Entity,
  Args extends readonly any[] = readonly any[],
  Return extends any = any,
> = (entity: Entity, ...args: Args) => Return
