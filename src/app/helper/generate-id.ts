export function generateId(): string {
  return btoa(crypto.randomUUID());
}
