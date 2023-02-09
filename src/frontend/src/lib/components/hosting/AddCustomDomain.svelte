<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { emit } from '$lib/utils/events.utils';
	import { i18n } from '$lib/stores/i18n.store';

	export let satellite: Satellite;
</script>

<button
	on:click={() =>
		emit({ message: 'junoModal', detail: { type: 'add_custom_domain', detail: { satellite } } })}
	>{$i18n.hosting.add_custom_domain}</button
>

<style lang="scss">
	button {
		margin: var(--padding-2x) 0 0;
	}
</style>
