export const sha256ToBase64String = (sha256: Uint8Array | number[]) =>
	btoa([...sha256].map((c) => String.fromCharCode(c)).join(''));
