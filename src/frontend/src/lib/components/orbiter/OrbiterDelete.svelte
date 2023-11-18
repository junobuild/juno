<script lang="ts">
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import type { Canister } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';
	import { createEventDispatcher } from 'svelte';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';

	export let canister: Canister | undefined = undefined;

	const dispatch = createEventDispatcher();

	const onDelete = () => {
		dispatch('junoDelete');

		emit({
			message: 'junoModal',
			detail: {
				type: 'delete_orbiter',
				detail: {
					cycles: canister?.data?.cycles ?? 0n
				}
			}
		});
	};
</script>

<CanisterDelete {canister} on:junoDelete={onDelete} />
