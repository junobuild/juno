<script lang="ts">
	import { fade } from 'svelte/transition';
	import SignIn from '$lib/components/core/SignIn.svelte';
	import Launchpad from '$lib/components/launchpad/Launchpad.svelte';

	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import WalletLoader from '$lib/components/wallet/WalletLoader.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import CanisterCyclesLoader from '$lib/components/loaders/CanisterCyclesLoader.svelte';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
</script>

{#if $authSignedIn}
	<div in:fade>
		<WalletLoader>
			<SatellitesLoader>
				<CanisterCyclesLoader satellites={$sortedSatellites}>
					<Launchpad />
				</CanisterCyclesLoader>
			</SatellitesLoader>
		</WalletLoader>
	</div>
{:else}
	<SignIn />
{/if}
