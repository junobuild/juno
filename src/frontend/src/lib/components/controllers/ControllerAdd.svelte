<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import type { SetControllerParams } from '$lib/types/controllers';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		add: (
			params: {
				missionControlId: Principal;
			} & SetControllerParams
		) => Promise<void>;
		load: () => Promise<void>;
		segment: CanisterSegmentWithLabel;
	}

	let { add, load, segment }: Props = $props();
</script>

<button
	onclick={() =>
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
