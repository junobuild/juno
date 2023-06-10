/* eslint-disable-next-line @typescript-eslint/ban-types */
export const debounce = (func: Function, timeout?: number) => {
	let timer: NodeJS.Timer | undefined;

	return (...args: unknown[]) => {
		const next = () => func(...args);

		if (timer) {
			clearTimeout(timer);
		}

		timer = setTimeout(next, timeout !== undefined && timeout > 0 ? timeout : 300);
	};
};
