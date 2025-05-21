export function detectMime(base64: string): string | null {
  const match = base64.match(/^data:(.*?);base64,/);
  return match ? match[1] : null;
}

export function getContent(base64: string): string {
  return base64.replace(/^data:(.*?);base64,/, "");
}
