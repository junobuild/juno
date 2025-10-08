<script lang="ts">
	import AuthConfig from '$lib/components/auth/AuthConfig.svelte';
	import AuthProviders from '$lib/components/auth/AuthProviders.svelte';
	import type { MissionControlDid } from '$lib/types/declarations';

	interface Props {
		satellite: MissionControlDid.Satellite;
	}

	let { satellite }: Props = $props();
</script>

<AuthProviders />

<AuthConfig {satellite} />
