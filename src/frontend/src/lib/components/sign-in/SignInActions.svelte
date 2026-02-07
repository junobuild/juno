<script lang="ts">
	import SignInGitHub from '$lib/components/sign-in/SignInGitHub.svelte';
	import SignInGoogle from '$lib/components/sign-in/SignInGoogle.svelte';
	import SignInII from '$lib/components/sign-in/SignInII.svelte';
	import SignInDev from "$lib/components/sign-in/SignInDev.svelte";
	import {isProd} from "$lib/env/app.env";
</script>

<div class="sign-in">
	<SignInDev />

	{#if isProd()}
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
