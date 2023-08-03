// Source: https://stackoverflow.com/a/70891826/5404186
export const digestMessage = (message?: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return crypto.subtle.digest('SHA-256', data);
};

export const sha256ToBase64String = (sha256: Iterable<number>): string =>
    btoa([...sha256].map((c) => String.fromCharCode(c)).join(''));