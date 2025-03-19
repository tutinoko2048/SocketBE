export function jsonParseFixed(json: string): any {
  // Replace invalid values with "-1"
  const fixedJson = json
    .replace(/:\s*-?nan\(ind\)/gi, ': -1') // Replace -nan(ind)
    .replace(/:\s*-?nan/gi, ': -1') // Replace nan, -nan
    .replace(/:\s*-?inf/gi, ': -1'); // Replace inf, -inf
  return JSON.parse(fixedJson);
}
