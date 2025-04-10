export function serializeStates(states: Record<string, string | number | boolean>): string {
  return `[${
    Object.entries(states).map(([key, value]) => `"${key}"=${JSON.stringify(value)}`).join(',')
  }]`;
}