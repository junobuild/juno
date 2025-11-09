/**
 * Shortens a string by inserting an ellipsis in the middle if it exceeds a certain length.
 *
 * For example: `"12345678901234567890"` with a length of `7` becomes `"1234567...5678901"`.
 *
 * @param {Object} params - Parameters object.
 * @param {string} params.text - The original text to shorten.
 * @param {number} [params.length=7] - The number of characters to keep from the start and end of the string.
 * @returns {string} The shortened string with a middle ellipsis if applicable.
 */
export const shortenWithMiddleEllipsis = ({
	text,
	length = 7
}: {
	text: string;
	length?: number;
}): string =>
	text.length > length + 2 ? `${text.slice(0, length)}...${text.slice(-1 * length)}` : text;
