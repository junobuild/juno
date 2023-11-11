import { browser } from '$app/environment';
import { isNullish } from '@dfinity/utils';

export const popupCenter = ({
	width,
	height
}: {
	width: number;
	height: number;
}): string | undefined => {
	if (!browser) {
		return undefined;
	}

	if (isNullish(window) || isNullish(window.top)) {
		return undefined;
	}

	const {
		top: { innerWidth, innerHeight }
	} = window;

	const y = innerHeight / 2 + screenY - height / 2;
	const x = innerWidth / 2 + screenX - width / 2;

	return `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${y}, left=${x}`;
};
