<script lang="ts">
	import AuthConfig from '$lib/components/auth/AuthConfig.svelte';
	import SignInMethod from '$lib/components/auth/SignInMethod.svelte';
	import type { Principal } from '@dfinity/principal';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();
</script>

<SignInMethod />

<AuthConfig {satelliteId} />
