<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { Principal } from '@dfinity/principal';
	import IconLink from '$lib/components/icons/IconLink.svelte';
	import { attachOrbiter } from '$lib/services/mission-control.services';
	import CanisterAttach from '$lib/components/canister/CanisterAttach.svelte';

	let visible: boolean | undefined;

	const setOrbiter = async ({
		missionControlId,
		canisterId
	}: {
		missionControlId: Principal;
		canisterId: Principal;
	}) => {
		await attachOrbiter({
			missionControlId,
			orbiterId: canisterId
		});
	};
</script>

<button on:click={() => (visible = true)} class="menu"><IconLink /> {$i18n.core.attach}</button>

<CanisterAttach on:junoAttach bind:visible setFn={setOrbiter}>
	<svelte:fragment slot="title">{$i18n.analytics.attach}</svelte:fragment>
	<svelte:fragment slot="input">{$i18n.analytics.attach_id}</svelte:fragment>
</CanisterAttach>
