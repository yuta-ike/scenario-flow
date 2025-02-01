export const log = <Target>(target: Target): Target => (
  console.log(target), target
)
