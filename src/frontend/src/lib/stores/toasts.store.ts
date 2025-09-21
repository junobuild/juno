import type { ToastMsg } from '$lib/types/toast';
import { errorDetailToString } from '$lib/utils/error.utils';
import { writable } from 'svelte/store';

const initToastsStore = () => {
	const { subscribe, update } = writable<ToastMsg[]>([]);

	return {
		subscribe,

		error({ text, detail }: { text: string; detail?: unknown }) {
			console.error(text, detail);
			update((messages: ToastMsg[]) => [
				...messages,
				{ text, level: 'error', detail: errorDetailToString(detail) }
			]);
		},

		show(msg: ToastMsg) {
			update((messages: ToastMsg[]) => [...messages, msg]);
		},

		warn(text: string) {
			this.show({
				text,
				level: 'warn',
				duration: 3000
			});
		},

		success(toast: { text: string; color?: 'primary' | 'secondary' | 'tertiary' }) {
			this.show({
				...toast,
				level: 'info',
				duration: 2000
			});
		},

		hide() {
			update((messages: ToastMsg[]) => messages.slice(1));
		}
	};
};

export const toasts = initToastsStore();
