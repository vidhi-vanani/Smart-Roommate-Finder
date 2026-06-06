export function tokenizeInterests(interests?: string | null) {
  return (interests || '')
    .split(',')
    .map((interest) => interest.trim().toLowerCase())
    .filter(Boolean);
}
