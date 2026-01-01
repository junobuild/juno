<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import type { AddAccessKeyResult, SetAccessKeyParams } from '$lib/types/controllers';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		add: (params: SetAccessKeyParams) => Promise<AddAccessKeyResult>;
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
				type: 'create_access_key',
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
