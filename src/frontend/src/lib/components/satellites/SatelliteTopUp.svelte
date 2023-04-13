<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { emit } from '$lib/utils/events.utils';
	import TopUp from '$lib/components/canister/TopUp.svelte';

	export let satellite: Satellite;

	let detail = { type: 'topup_satellite', detail: { satellite } };
</script>

<TopUp {detail} />
