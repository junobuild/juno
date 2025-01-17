<script lang="ts">
	import { fade } from 'svelte/transition';
	import SignIn from '$lib/components/core/SignIn.svelte';
	import Launchpad from '$lib/components/launchpad/Launchpad.svelte';

	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import WalletLoader from '$lib/components/wallet/WalletLoader.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
</script>

{#if $authSignedIn}
	<div in:fade>
		<WalletLoader>
			<SatellitesLoader>
				<Launchpad />
			</SatellitesLoader>
		</WalletLoader>
	</div>
{:else}
	<SignIn />
{/if}
