<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { authNotSignedIn } from '$lib/derived/auth.derived';
	import { syncSnapshots } from '$lib/services/ic-mgmt/snapshots.services';
	import { syncSubnets } from '$lib/services/ic-mgmt/subnets.services';
	import { syncSatellitesConfig } from '$lib/services/satellite/satellite-config.services';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const syncIdbData = async () =>
		await Promise.all([syncSubnets(), syncSnapshots(), syncSatellitesConfig()]);

	onMount(i18n.init);

	$effect(() => {
		$authNotSignedIn;

		if ($authNotSignedIn) {
			return;
		}

		syncIdbData();
	});
</script>

{@render children()}
