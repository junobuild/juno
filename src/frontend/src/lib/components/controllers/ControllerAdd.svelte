<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SetControllerParams } from '$lib/types/controllers';
	import { emit } from '$lib/utils/events.utils';

	export let add: (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	) => Promise<void>;
	export let load: () => Promise<void>;
	export let segment: {
		label: string;
		id: Principal;
	};
</script>

<button
	on:click={() =>
		emit({
			message: 'junoModal',
			detail: {
				type: 'create_controller',
				detail: {
					add,
					load,
					segment
				}
			}
		})}>{$i18n.controllers.add_a_controller}</button
>

<style lang="scss">
	button {
		margin: var(--padding) 0 0;
	}
</style>
