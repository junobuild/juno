/**
 * Shortens the text from the middle. Ex: "12345678901234567890" -> "1234567...5678901"
 * @param text
 * @returns text
 */
export const shortenWithMiddleEllipsis = (text: string): string =>
	text.length > 16 ? `${text.slice(0, 7)}...${text.slice(-7)}` : text;
