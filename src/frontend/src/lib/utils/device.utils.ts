export const isIPhone = (userAgent: string): boolean => /iPhone|iPod/i.test(userAgent);

export const isAndroid = (userAgent: string): boolean => /android|sink/i.test(userAgent);

export const isAndroidTablet = (userAgent: string): boolean =>
	isAndroid(userAgent) && !/mobile/i.test(userAgent);
