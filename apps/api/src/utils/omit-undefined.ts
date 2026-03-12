export function omitUndefined<T extends object>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as {
    [K in keyof T as undefined extends T[K] ? never : K]: Exclude<T[K], undefined>;
  } & {
    [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
  };
}
