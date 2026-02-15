<script lang="ts">
	import SignInDev from '$lib/components/auth/sign-in/SignInDev.svelte';
	import SignInGitHub from '$lib/components/auth/sign-in/SignInGitHub.svelte';
	import SignInGoogle from '$lib/components/auth/sign-in/SignInGoogle.svelte';
	import SignInII from '$lib/components/auth/sign-in/SignInII.svelte';
	import { isDev, isNotSkylab, isProd } from '$lib/env/app.env';
</script>

<div class="sign-in">
	{#if isDev()}
		<SignInDev />
	{/if}

	{#if isProd() && isNotSkylab()}
		<SignInGoogle />

		<SignInGitHub />

		<SignInII />
	{/if}
</div>

<style lang="scss">
	.sign-in {
		display: flex;
		flex-direction: column;

		width: fit-content;
	}
</style>
