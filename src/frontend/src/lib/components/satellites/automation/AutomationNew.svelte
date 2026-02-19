<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';
	import { emit } from '$lib/utils/events.utils';
	import { isSkylab } from '$lib/env/app.env';
	import { toasts } from '$lib/stores/app/toasts.store';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	const createAutomation = () => {
		if (isSkylab()) {
			toasts.warn($i18n.automation.warn_skylab);
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'create_automation',
				detail: {
					satellite
				}
			}
		});
	};
</script>

<button onclick={createAutomation}>{$i18n.core.configure}</button>

<style lang="scss">
	button {
		margin: 0;
	}
</style>
