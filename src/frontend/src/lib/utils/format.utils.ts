/**
 * Shortens a string by inserting an ellipsis in the middle if it exceeds a certain length.
 *
 * For example: `"12345678901234567890"` with a length of `7` becomes `"1234567...5678901"`.
 *
 * @param {Object} params - Parameters object.
 * @param {string} params.text - The original text to shorten.
 * @param {number} [params.startLength] - The number of characters to keep from the start and end of the string.
 * @param {number} [params.endLength]
 * @returns {string} The shortened string with a middle ellipsis if applicable.
 */
export const shortenWithMiddleEllipsis = ({
	text,
	startLength = 9,
	endLength = 9
}: {
	text: string;
	startLength?: number;
	endLength?: number;
}): string => {
	const addedStart = startLength + 2;
	return text.length > addedStart + endLength + 3
		? `${text.slice(0, addedStart)}...${text.slice(-endLength)}`
		: text;
};
