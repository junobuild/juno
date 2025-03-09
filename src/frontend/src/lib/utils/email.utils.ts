// Source: https://stackoverflow.com/a/46181/5404186
export const isValidEmail = (email: string): boolean =>
	email.match(
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	) !== null;

export const isNotValidEmail = (email: string): boolean => !isValidEmail(email);
