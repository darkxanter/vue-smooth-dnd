export function omitUndefined<T extends Record<string, any> = any>(obj: T): T {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key as keyof T] = obj[key]
    }
    return acc
  }, {} as T)
}
