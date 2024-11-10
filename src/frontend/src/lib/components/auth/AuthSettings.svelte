<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import AuthConfig from '$lib/components/auth/AuthConfig.svelte';
	import SignInMethod from '$lib/components/auth/SignInMethod.svelte';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();
</script>

<SignInMethod />

<AuthConfig {satelliteId} />
