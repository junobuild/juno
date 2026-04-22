<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { AddAccessKeyResult, AddAccessKeyParams } from '$lib/types/access-keys';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		add: (params: AddAccessKeyParams) => Promise<AddAccessKeyResult>;
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
