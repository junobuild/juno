<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import AuthConfig from '$lib/components/auth/AuthConfig.svelte';
	import AuthProviders from '$lib/components/auth/AuthProviders.svelte';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();
</script>

<AuthProviders />

<AuthConfig {satellite} />
