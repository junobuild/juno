import { browser } from '$app/environment';

const onBeforeUnload = ($event: BeforeUnloadEvent) => {
	$event.preventDefault();
	return ($event.returnValue = 'Are you sure you want to exit?');
};

const addBeforeUnload = () => {
	window.addEventListener('beforeunload', onBeforeUnload, { capture: true });
};

const removeBeforeUnload = () => {
	window.removeEventListener('beforeunload', onBeforeUnload, { capture: true });
};

export const confirmToCloseBrowser = (dirty: boolean) => {
	if (!browser) {
		return;
	}

	if (dirty) {
		addBeforeUnload();
		return;
	}

	removeBeforeUnload();
};
