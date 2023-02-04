<script lang="ts">
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { nonNullish } from '$lib/utils/utils';
	import CanisterTopUpModal from '$lib/components/modals/CanisterTopUpModal.svelte';
</script>

{#if nonNullish($missionControlStore)}
	<CanisterTopUpModal canisterId={$missionControlStore} on:junoClose>
		<svelte:fragment slot="intro">
			<h2>Top-up mission control center</h2>

			<p>Because you own your data, you also own your mission control center.</p>

			<p>TODO: Link to help</p>

			<p>
				As for your satellites, you have to make sure there is always enough cycles to cover the
				costs for the options.
			</p>
		</svelte:fragment>

		<svelte:fragment slot="outro">
			<p>Your mission control center has been topped-up.</p>
		</svelte:fragment>
	</CanisterTopUpModal>
{/if}
