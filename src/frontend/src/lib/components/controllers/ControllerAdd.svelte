<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SetControllerParams } from '$lib/types/controllers';
	import { emit } from '$lib/utils/events.utils';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';

	export let add: (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	) => Promise<void>;
	export let load: () => Promise<void>;
	export let segment: CanisterSegmentWithLabel;
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
		margin: 0;
	}
</style>
