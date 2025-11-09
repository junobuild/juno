import { nonNullish } from '@dfinity/utils';

export const isIPhone = (userAgent: string): boolean => /iPhone|iPod/i.test(userAgent);

export const isAndroid = (userAgent: string): boolean => /android|sink/i.test(userAgent);

export const isAndroidTablet = (userAgent: string): boolean =>
	isAndroid(userAgent) && !/mobile/i.test(userAgent);

interface UserAgentData {
	mobile?: boolean;
}

export const isMobile = (): boolean => {
	if ('userAgentData' in navigator && nonNullish(navigator.userAgentData)) {
		const { userAgentData } = navigator as { userAgentData: UserAgentData };
		return nonNullish(userAgentData.mobile) && userAgentData.mobile;
	}

	const isTouchScreen = window.matchMedia('(any-pointer:coarse)').matches;
	const isMouseScreen = window.matchMedia('(any-pointer:fine)').matches;
	return isTouchScreen && !isMouseScreen;
};

export const isDesktop = () => !isMobile();
