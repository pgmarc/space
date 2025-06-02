export function toPlainObject<T>(doc: unknown): T {
  return doc as unknown as T;
}