<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	const createAutomation = () => {
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
