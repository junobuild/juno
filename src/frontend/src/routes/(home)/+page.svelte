<script lang="ts">
	import { fade } from 'svelte/transition';
	import SignIn from '$lib/components/core/SignIn.svelte';
	import Launchpad from '$lib/components/launchpad/Launchpad.svelte';

	import CanistersLoader from '$lib/components/loaders/CanistersLoader.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import WalletLoader from '$lib/components/wallet/WalletLoader.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
</script>

{#if $authSignedIn}
	<div in:fade>
		<WalletLoader>
			<SatellitesLoader>
				<CanistersLoader satellites={$sortedSatellites}>
					<Launchpad />
				</CanistersLoader>
			</SatellitesLoader>
		</WalletLoader>
	</div>
{:else}
	<SignIn />
{/if}
