import { type CertifiedStore, initCertifiedStore } from '$lib/stores/_certified.store';

export interface UncertifiedStore<T> extends Omit<CertifiedStore<T>, 'set'> {
	set: (data: T) => void;
}

// Just a shorthand. That way we can find easily which store uses the pattern but, not yet query+update.
export const initUncertifiedStore = <T>(): UncertifiedStore<T> => {
	const { set, ...rest } = initCertifiedStore<T>();

	return {
		...rest,

		set(data) {
			set({
				data,
				certified: false
			});
		}
	};
};
