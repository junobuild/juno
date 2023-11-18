<script lang="ts">
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import Actions from '$lib/components/core/Actions.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import type { Canister } from '$lib/types/canister';
	import OrbiterDelete from '$lib/components/orbiter/OrbiterDelete.svelte';

	export let orbiter: Orbiter;

	let canister: Canister | undefined = undefined;

	const onSyncCanister = (syncCanister: Canister) => {
		if (syncCanister.id !== orbiter.orbiter_id.toText()) {
			return;
		}

		canister = syncCanister;
	};

	let visible: boolean | undefined;
	const close = () => (visible = false);
</script>

<svelte:window on:junoSyncCanister={({ detail: { canister } }) => onSyncCanister(canister)} />

<Actions bind:visible>
	<TopUp type="topup_orbiter" on:junoTopUp={close} />

	<CanisterStopStart {canister} segment="orbiter" on:junoStop={close} on:junoStart={close} />

	<OrbiterDelete {canister} on:junoDelete={close} />
</Actions>
