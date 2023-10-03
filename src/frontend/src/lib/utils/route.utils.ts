/**
 * Update browser URL. To be use only for really particular use case that do not include navigation and loading data.
 */
export const replaceHistory = (url: URL) => {
	if (!supportsHistory()) {
		window.location.replace(url);
		return;
	}

	history.replaceState({}, '', url);
};

/**
 * Test if the History API is supported by the devices. On old phones it might not be the case.
 * Source: https://stackoverflow.com/a/6825002/5404186
 */
const supportsHistory = (): boolean =>
	window.history !== undefined &&
	'pushState' in window.history &&
	typeof window.history.pushState !== 'undefined';
