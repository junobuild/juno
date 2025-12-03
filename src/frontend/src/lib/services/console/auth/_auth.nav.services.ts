const AUTH_ORIGIN_KEY = 'juno:console:auth:origin';

export const saveAuthNavOrigin = () => {
	const {
		location: { pathname, search }
	} = window;
	const url = `${pathname}${search}`;
	sessionStorage.setItem(AUTH_ORIGIN_KEY, url);
};

export const getAndClearAuthNavOrigin = (): string => {
	try {
		const url = sessionStorage.getItem(AUTH_ORIGIN_KEY);
		return url ?? '/';
	} finally {
		clearAuthNavOrigin();
	}
};

export const clearAuthNavOrigin = () => sessionStorage.removeItem(AUTH_ORIGIN_KEY);
