<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import AuthConfig from '$lib/components/auth/AuthConfig.svelte';
	import SignInMethod from '$lib/components/auth/SignInMethod.svelte';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();
</script>

<SignInMethod />

<AuthConfig {satellite} />
