/**
 * Shortens a string by inserting an ellipsis in the middle if it exceeds a certain length.
 *
 * For example: `"12345678901234567890"` with a length of `7` becomes `"1234567...5678901"`.
 *
 * @param {Object} params - Parameters object.
 * @param {string} params.text - The original text to shorten.
 * @param {number} [params.length=9] - The number of characters to keep from the start and end of the string.
 * @returns {string} The shortened string with a middle ellipsis if applicable.
 */
export const shortenWithMiddleEllipsis = ({
	text,
	length = 9
}: {
	text: string;
	length?: number;
}): string => {
	const startLength = length + 2;
	const endLength = length;
	return text.length > startLength + endLength + 2
		? `${text.slice(0, startLength)}...${text.slice(-endLength)}`
		: text;
};
