export const sha256ToBase64String = (sha256: Uint8Array) =>
	btoa([...sha256].map((c) => String.fromCharCode(c)).join(''));
