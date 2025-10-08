<script lang="ts">
	import type { MissionControlDid } from '$declarations';
	import AuthConfig from '$lib/components/auth/AuthConfig.svelte';
	import AuthProviders from '$lib/components/auth/AuthProviders.svelte';

	interface Props {
		satellite: MissionControlDid.Satellite;
	}

	let { satellite }: Props = $props();
</script>

<AuthProviders />

<AuthConfig {satellite} />
